import express from 'express'
import { build as esbuild } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToReadableStream } from 'react-server-dom-webpack/server.browser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static('build'))

app.get('/', async (request, response) => {
  response.sendFile(path.join(__dirname, 'src', '/_client.html'))
})

app.get('/rsc', async (request, response) => {
  const page = await import('./build/app.js')
  const stream = renderToReadableStream(createElement(page.default))

  for await (const chunk of stream) {
    response.write(chunk)
  }
  response.end()
})

app.listen(3000, async () => {
  await build()
  console.log(`App listening on port 3000`)
})

async function build() {
  await esbuild({
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    packages: 'external',
    logLevel: 'error',
    entryPoints: [path.join(__dirname, 'src', 'app.tsx')],
    outdir: path.join(__dirname, 'build'),
  })

  await esbuild({
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    logLevel: 'error',
    entryPoints: [path.join(__dirname, 'src', '_client.ts')],
    outdir: path.join(__dirname, 'build', 'build'),
  })
}
