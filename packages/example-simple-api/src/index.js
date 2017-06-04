import path from 'path'
import express from 'express'
import Preact from 'preact'
import renderToString from 'preact-render-to-string'
import second from 'second'
import template from './template'

second.init({ VDom: Preact, VDomServer: { renderToString } })

const app = express()

app.get('/events/:user', (req, res) => {
  const Page = require('./components/page')

  second.render(Page, req.params).then(content =>
    res.render('page', { content })
  )
})

app.use(express.static(path.resolve(__dirname, '../static')))

app.engine('html', template)
app.set('views', `${__dirname}/../views`)
app.set('view engine', 'html')

const APP_PORT = process.env.SECOND_API_PORT || 8082

app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT} (http://127.0.0.1:${APP_PORT})`))
