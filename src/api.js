import Promise from 'bluebird'
import express from 'express'

import template from './template'
import render from './renderer'

const app = express()

const renderModuleIntoEnvelope = (module, params) =>
  Promise.all([
    render(module, params),
    Promise.resolve(['<style>body{color:red}</style>'])
  ]).then(([bodyInline, head]) => ({ head, bodyInline, bodyLast: [] }))

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
