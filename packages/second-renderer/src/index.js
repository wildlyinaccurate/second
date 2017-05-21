import Promise from 'bluebird'
import debug from 'debug'

const RERENDER_DELAY = 100
const log = debug('second:renderer')

export default class Renderer {
  constructor ({ VDom, VDomServer, fetcher }) {
    this.VDom = VDom
    this.VDomServer = VDomServer
    this.fetcher = fetcher
  }

  render (Component, params) {
    return this.renderUntilComplete(
      this.VDomServer.renderToString,
      Component,
      params
    )
  }

  renderStatic (Component, params) {
    return this.renderUntilComplete(
      this.VDomServer.renderToStaticMarkup,
      Component,
      params
    )
  }

  renderUntilComplete (render, Component, params) {
    log(`Starting render of ${Component.wrappedComponentName}`)

    return new Promise((resolve, reject) => {
      const rendered = render(
        this.VDom.createElement(Component, params)
      )

      if (this.fetcher.hasOutstandingRequests()) {
        // Requests were made to the fetcher which have not yet been resolved
        log(`Fetcher has outstanding requests. Waiting ${RERENDER_DELAY}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(render, Component, params))
      }

      log(`Completed render of ${Component.wrappedComponentName}`)
      resolve(rendered)
    }).catch(e => {
      if (this.fetcher.hasOutstandingRequests()) {
        // The error was potentially due to missing data in a downstream
        // component; try again
        log(`Error thrown by ${Component.wrappedComponentName}. Fetcher has outstanding requests. Waiting ${RERENDER_DELAY}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(render, Component, params))
      }

      throw e
    })
  }
}
