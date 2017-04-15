import Promise from 'bluebird'
import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import proxyquire from 'proxyquire'

import Fetcher from './fetcher'
import Container from './container'

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })

export default function render (componentModule, params) {
  const fetcher = new Fetcher()
  const container = new Container(fetcher)

  const Component = proxyquire.noCallThru()(componentModule, {
    'bbc-morph-grandstand': () => {},
    'morph-container': makeGlobal(container),
    'react': makeGlobal(React)
  })

  return renderUntilComplete(fetcher, Component, params)
}

function renderUntilComplete (fetcher, Component, params) {
  return new Promise((resolve, reject) => {
    const rendered = renderToString(createElement(Component, params))


    if (fetcher.hasOutstandingRequests()) {
      // Requests were made to the fetcher which have not yet been resolved
      return Promise.delay(50).then(() => renderUntilComplete(fetcher, Component, params))
    }

    resolve(rendered)
  }).catch(e => {
    if (fetcher.hasOutstandingRequests()) {
      // The error was potentially due to missing data in a downstream
      // component; try again
      return Promise.delay(50).then(() => renderUntilComplete(fetcher, Component, params))
    }

    throw e
  })
}
