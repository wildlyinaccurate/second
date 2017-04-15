import React from 'react'
import ReactDOMServer from 'react-dom/server'

import PreactCompat from 'preact-compat'
import PreactCompatServer from 'preact-compat/server'

import Preact from 'preact'
import PreactRenderToString from 'preact-render-to-string'

export default function getRendererLib (identifier) {
  switch (identifier) {
    case 'preact':
      return [Preact, {
        renderToString: PreactRenderToString,
        renderToStaticMarkup: PreactRenderToString
      }]

    case 'preact-compat':
      return [PreactCompat, PreactCompatServer]

    case 'react':
      return [React, ReactDOMServer]

    default:
      throw new Error(`Invalid renderer "${identifier}" specified.`)
  }
}
