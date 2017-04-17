import express from 'express'
import Renderer from 'second-renderer'

import getRendererLib from './get-renderer-lib'
import template from './template'

const app = express()

const DEFAULT_RENDERER_LIB = 'preact-compat'
const [VDom, VDomRenderer] = getRendererLib(DEFAULT_RENDERER_LIB)
const renderer = new Renderer({ VDom, VDomRenderer })

const wrapStyle = style => `<style>${style}</style>`

const renderModuleIntoEnvelope = (module, params) => {
  if (params['@@renderer']) {
    [renderer.VDom, renderer.VDomRenderer] = getRendererLib(params['@@renderer'])
  }

  return renderer.render(module, params).then(component => ({
    head: component.styles.enhanced.map(wrapStyle),
    bodyInline: component.markup,
    bodyLast: []
  }))
}

app.get('/render/:module', (req, res) => {
  renderModuleIntoEnvelope(req.params.module, req.query)
    .then(envelope => res.send(envelope))
})

app.get('/preview/:module', (req, res) => {
  renderModuleIntoEnvelope(req.params.module, req.query)
    .then(envelope => res.render('preview', {
      head: envelope.head.join('\n'),
      bodyInline: envelope.bodyInline,
      bodyLast: envelope.bodyLast.join('\n')
    }))
})

app.engine('html', template)
app.set('views', './views')
app.set('view engine', 'html')

app.listen(8082, () => console.log('Listening on port 8082 (http://127.0.0.1:8082)'))
