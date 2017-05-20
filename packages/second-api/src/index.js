import express from 'express'

import template from './template'
import renderModuleIntoEnvelope from './render-module'

const app = express()

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

app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT} (http://127.0.0.1:${APP_PORT})`))
