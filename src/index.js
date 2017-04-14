import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import proxyquire from 'proxyquire'

import * as Container from './container'

export function render (module, params) {
  const element = proxyquire(module, {
    'bbc-morph-grandstand': () => {},
    'morph-container': Object.assign({}, Container),
    'react': React
  })

  return renderToString(createElement(element, params))
}
