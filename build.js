import { build as esbuild } from 'esbuild'
import path from 'node:path'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { parse } from 'es-module-lexer'
import { fileURLToPath } from 'node:url'
import { rimraf } from 'rimraf'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientComponentMap = {}
const clientEntryPoint = new Set()

await rimraf(path.join(__dirname, 'build'))

await esbuild({
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  packages: 'external',
  logLevel: 'error',
  entryPoints: [path.join(__dirname, 'src', 'server', 'server.ts')],
  outdir: path.join(__dirname, 'build'),
  plugins: [
    {
      name: 'mark-componentjs-external',
      setup(build) {
        build.onResolve(
          {
            filter: /_component/,
          },
          ({ path: relativePath }) => ({
            external: true,
            path: relativePath + '.js',
          }),
        )
      },
    },
    {
      name: 'resolve-client-imports',
      setup(build) {
        build.onResolve(
          {
            filter: /\.{1,2}\//,
          },
          async ({ path: relativePath, resolveDir }) => {
            let absolutePath = path.resolve(resolveDir, relativePath)
            let content = ''

            for (const extension of ['', '.jsx', '.tsx']) {
              try {
                content = await readFile(absolutePath + extension, 'utf8')
                break
              } catch {
                // do nothing
              }
            }

            if (
              content.startsWith("'use client'") ||
              content.startsWith('"use client"')
            ) {
              clientEntryPoint.add(absolutePath)
              return {
                external: true,
                path: /\.[jt]sx$/.test(relativePath)
                  ? './' +
                    path
                      .relative(path.join(__dirname, 'src'), absolutePath)
                      .replace(/\.[jt]sx$/, '.js')
                  : './' +
                    path.relative(path.join(__dirname, 'src'), absolutePath) +
                    '.js',
              }
            }
          },
        )
      },
    },
  ],
})

const { outputFiles } = await esbuild({
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  splitting: true,
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'error',
  entryPoints: [path.join(__dirname, 'src', '_client.ts'), ...clientEntryPoint],
  outdir: path.join(__dirname, 'build'),
  write: false,
})

const writePromise = []

for (const file of outputFiles) {
  const [, exports] = parse(file.text)
  let newContents = file.text

  for (const exp of exports) {
    const key = `${file.hash}_${exp.ln}_${exp.n}`

    clientComponentMap[key] = {
      id: `/build/${path.relative(path.join(__dirname, 'build'), file.path)}`,
      name: exp.n,
      chunks: [],
      async: true,
    }

    newContents +=
      `${exp.ln}.$$id = "${key}";` +
      `${exp.ln}.$$typeof = Symbol.for("react.client.reference");`
  }

  writePromise.push(
    await mkdir(path.dirname(file.path), { recursive: true }).then(
      async () => await writeFile(file.path, newContents),
    ),
  )
}

writePromise.push(
  writeFile(
    path.join(__dirname, 'build', '_component.js'),
    'export default ' + JSON.stringify(clientComponentMap),
  ),
  copyFile(
    path.join(__dirname, 'src', 'index.html'),
    path.join(__dirname, 'build', 'index.html'),
  ),
)

await Promise.allSettled(writePromise)
