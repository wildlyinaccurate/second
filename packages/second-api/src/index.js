import express from 'express'
import debug from 'debug'
import Renderer from 'second-renderer'

import getRendererLib from './get-renderer-lib'
import template from './template'

const app = express()
const log = debug('second:api')

const DEFAULT_RENDERER_LIB = 'preact-compat'
const [VDom, VDomServer] = getRendererLib(DEFAULT_RENDERER_LIB)
const renderer = new Renderer({ VDom, VDomServer })

const wrapStyle = style => `<style>${style}</style>`

const renderModuleIntoEnvelope = (module, params) => {
  if (params['@@renderer']) {
    [renderer.VDom, renderer.VDomServer] = getRendererLib(params['@@renderer'])
  }

  return renderer.render(module, params).then(component => ({
    head: component.styles.enhanced.map(wrapStyle),
    bodyInline: component.markup,
    bodyLast: []
  }))
}

app.get('/render/:module', (req, res, next) => {
  renderModuleIntoEnvelope(req.params.module, req.query)
    .then(envelope => res.send(envelope))
    .catch(next)
})

app.get('/preview/:module', (req, res, next) => {
  renderModuleIntoEnvelope(req.params.module, req.query)
    .then(envelope => res.render('preview', {
      head: envelope.head.join('\n'),
      bodyInline: envelope.bodyInline,
      bodyLast: envelope.bodyLast.join('\n')
    }))
    .catch(next)
})

app.engine('html', template)
app.set('views', `${__dirname}/../views`)
app.set('view engine', 'html')

const APP_PORT = process.env.SECOND_API_PORT || 8082

app.listen(APP_PORT, () => log(`Listening on port ${APP_PORT} (http://127.0.0.1:${APP_PORT})`))
