import express from 'express'

import { render } from '.'

const app = express()

app.get('/render/:module', (req, res) => {
  render(req.params.module, req.query)
    .then(html => {
      res.send(html)
    })
})

app.listen(8082, () => console.log('Listening on port 8082 (http://127.0.0.1:8082)'))
