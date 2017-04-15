import Promise from 'bluebird'
import proxyquire from 'proxyquire'
import { propOr } from 'lodash/fp'

import getRendererLib from './renderer-lib'
import Container from './container'
import Fetcher from '../fetcher'

const DEFAULT_RENDERER_LIB = 'preact-compat'

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })

export default function render (componentModule, params) {
  const renderer = propOr(DEFAULT_RENDERER_LIB, '@@renderer', params)
  const [React, ReactDOMServer] = getRendererLib(renderer)

  const fetcher = new Fetcher()
  const container = new Container(React, fetcher)

  const Component = proxyquire.noCallThru()(componentModule, {
    'bbc-morph-grandstand': () => {},
    'morph-container': makeGlobal(container),
    'react': makeGlobal(React)
  })

  return renderUntilComplete(React, ReactDOMServer, fetcher, Component, params)
}

function renderUntilComplete (React, ReactDOMServer, fetcher, Component, params) {
  return new Promise((resolve, reject) => {
    const rendered = ReactDOMServer.renderToString(
      React.createElement(Component, params)
    )

    if (fetcher.hasOutstandingRequests()) {
      // Requests were made to the fetcher which have not yet been resolved
      return Promise.delay(50).then(() => renderUntilComplete(React, ReactDOMServer, fetcher, Component, params))
    }

    resolve(rendered)
  }).catch(e => {
    if (fetcher.hasOutstandingRequests()) {
      // The error was potentially due to missing data in a downstream
      // component; try again
      return Promise.delay(50).then(() => renderUntilComplete(React, ReactDOMServer, fetcher, Component, params))
    }

    throw e
  })
}
