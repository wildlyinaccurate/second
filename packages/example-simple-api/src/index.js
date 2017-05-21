import express from 'express'
import VDom from 'preact-compat'
import VDomServer from 'preact-compat/server'
import Renderer from 'second-renderer'

import Page from './components/page'
import fetcher from './global-fetcher'
import template from './template'

const app = express()
const renderer = new Renderer({
  VDom,
  VDomServer,
  shouldTryAgain: () => fetcher.hasOutstandingRequests()
})

app.get('/events/:user', (req, res) => {
  renderer.render(Page, req.params).then(content =>
    res.render('page', { content })
  )
})

app.engine('html', template)
app.set('views', `${__dirname}/../views`)
app.set('view engine', 'html')

const APP_PORT = process.env.SECOND_API_PORT || 8082

app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT} (http://127.0.0.1:${APP_PORT})`))
