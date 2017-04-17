import Promise from 'bluebird'
import express from 'express'
import render from 'second-renderer'

import template from './template'

const app = express()

const wrapStyle = style => `<style>${style}</style>`

const renderModuleIntoEnvelope = (module, params) =>
  render(module, params).then(component => ({
    head: component.styles.enhanced.map(wrapStyle),
    bodyInline: component.markup,
    bodyLast: []
  }))

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
