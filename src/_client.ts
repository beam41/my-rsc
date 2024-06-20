import { createRoot } from 'react-dom/client'
// @ts-expect-error Could not find a declaration file for module react-server-dom-webpack/client.
import { createFromFetch } from 'react-server-dom-webpack/client'

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = async (id) => {
  return import(id)
}

// @ts-expect-error `root` might be null
const root = createRoot(document.querySelector('#root'))

/**
 * Fetch your server component stream from `/__rsc`
 * and render results into the root element as they come in.
 */
root.render(await createFromFetch(fetch('/__rsc')))
