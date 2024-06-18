import express from 'express'
import { createElement } from 'react'
//@ts-expect-error Could not find a declaration file for module react-server-dom-webpack/server.browser.
import { renderToReadableStream } from 'react-server-dom-webpack/server.browser'
import App from '../client/app'
import clientComponentMap from './_component'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use('/build', express.static('build'))

app.get('/', function (request, response) {
  response.sendFile('./index.html', { root: __dirname })
})

app.get('/rsc', async (request, response) => {
  const stream = renderToReadableStream(createElement(App), clientComponentMap)

  for await (const chunk of stream) {
    response.write(chunk)
  }
  response.end()
})

app.listen(3000, async () => {
  console.log(`App listening on port 3000`)
})
