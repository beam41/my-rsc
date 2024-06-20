import { build as esbuild } from 'esbuild'
import path from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { parse } from 'es-module-lexer'
import { fileURLToPath } from 'node:url'
import { rimraf } from 'rimraf'
import { sassPlugin } from 'esbuild-sass-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function pathSource(...morePath) {
  return path.join(__dirname, 'src', ...morePath)
}

function pathBuild(...morePath) {
  return path.join(__dirname, 'build', ...morePath)
}

const clientComponentMap = {}
const clientEntryPoint = new Set()

await rimraf(pathBuild())

await esbuild({
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  packages: 'external',
  logLevel: 'error',
  entryPoints: [pathSource('server', 'server.ts')],
  outdir: pathBuild(),
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

            if (/^["']use client["']/.test(content)) {
              clientEntryPoint.add(absolutePath)

              const { name } = path.parse(absolutePath)

              return {
                external: true,
                path: path.join('__BUILD_PLACEHOLDER', 'client', name + '.js'),
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
  entryPoints: [pathSource('_client.ts'), ...clientEntryPoint],
  outdir: pathBuild(),
  entryNames: 'client/[name]',
  write: false,
  plugins: [sassPlugin()],
})

const { outputFiles: outputCssFiles } = await esbuild({
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'error',
  entryPoints: [pathSource('style', 'index.scss')],
  outdir: pathBuild(),
  write: false,
  plugins: [
    sassPlugin({
      embedded: true,
    }),
  ],
})

const writePromise = []
const pathToHashed = {}

let clientFilePath = ''

for (const file of outputFiles) {
  const [, exports] = parse(file.text)

  let newContents = file.text
  let filePath = file.path

  if (/^["']use client["']/.test(file.text)) {
    let normHash = file.hash.replaceAll(/[/\\]/g, '_')
    const { name, ext, dir } = path.parse(file.path)
    filePath = path.join(dir, `${name}-${normHash}${ext}`)
    const relativePath = path.relative(pathBuild(), filePath)

    for (const exp of exports) {
      const key = `${normHash}_${exp.ln}_${exp.n}`

      clientComponentMap[key] = {
        id: `/build/${relativePath.replaceAll(path.sep, '/')}`,
        name: exp.n,
        chunks: [],
        async: true,
      }

      newContents +=
        `${exp.ln}.$$id = "${key}";` +
        `${exp.ln}.$$typeof = Symbol.for("react.client.reference");`
    }

    pathToHashed[path.relative(pathBuild(), file.path)] = relativePath
  }

  if (path.basename(file.path) === '_client.js') {
    const { name, ext, dir } = path.parse(file.path)
    filePath = path.join(dir, `${name}-${file.hash}${ext}`)
    clientFilePath = path.relative(pathBuild(), filePath)
  }

  writePromise.push(
    await mkdir(path.dirname(filePath), { recursive: true }).then(
      async () => await writeFile(filePath, newContents),
    ),
  )
}

async function replacePlaceHolder() {
  const serverFile = pathBuild('server.js')
  let content = await readFile(serverFile, 'utf8')

  for (const [placeholderPath, hashedPath] of Object.entries(pathToHashed)) {
    content = content.replaceAll(
      path
        .join('__BUILD_PLACEHOLDER', placeholderPath)
        .replaceAll('\\', '\\\\'),
      './' + hashedPath.replaceAll('\\', '\\\\'),
    )
  }

  await writeFile(serverFile, content, 'utf8')
}

async function copyIndexHtml() {
  const indexHtmlFile = pathSource('index.html')
  let content = await readFile(indexHtmlFile, 'utf8')

  content = content.replaceAll(
    '{{CLIENT_PATH}}',
    './build/' + clientFilePath.replaceAll('\\', '/'),
  )

  content = content.replaceAll(
    '{{CLIENT_STYLE}}',
    `<style>${outputCssFiles[0].text}</style>`,
  )

  await writeFile(pathBuild('index.html'), content, 'utf8')
}

writePromise.push(
  // eslint-disable-next-line unicorn/prefer-top-level-await
  replacePlaceHolder(),
  writeFile(
    pathBuild('_component.js'),
    'export default ' + JSON.stringify(clientComponentMap),
  ),
  // eslint-disable-next-line unicorn/prefer-top-level-await
  copyIndexHtml(),
)

await Promise.all(writePromise)

console.log('Build time:', (process.uptime() * 1000).toFixed(3) + 'ms')
