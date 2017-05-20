import Promise from 'bluebird'
import debug from 'debug'

const RERENDER_DELAY = 100
const log = debug('second:renderer')

export default class Renderer {
  constructor ({ VDom, VDomServer, fetcher, loadComponent = require }) {
    this.VDom = VDom
    this.VDomServer = VDomServer
    this.fetcher = fetcher
    this.loadComponent = loadComponent
  }

  render (componentModule, params) {
    const Component = this.loadComponent(componentModule)

    return this.renderUntilComplete(Component, params)
  }

  renderUntilComplete (Component, params) {
    log(`Starting render of ${Component.wrappedComponentName}`)

    return new Promise((resolve, reject) => {
      const renderFn = params['@@static'] ? 'renderToStaticMarkup' : 'renderToString'
      const rendered = this.VDomServer[renderFn](
        this.VDom.createElement(Component, params)
      )

      if (this.fetcher.hasOutstandingRequests()) {
        // Requests were made to the fetcher which have not yet been resolved
        log(`Fetcher has outstanding requests. Waiting ${RERENDER_DELAY}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(Component, params))
      }

      log(`Completed render of ${Component.wrappedComponentName}`)
      resolve(rendered)
    }).catch(e => {
      if (this.fetcher.hasOutstandingRequests()) {
        // The error was potentially due to missing data in a downstream
        // component; try again
        log(`Error thrown by ${Component.wrappedComponentName}. Fetcher has outstanding requests. Waiting ${RERENDER_DELAY}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(Component, params))
      }

      throw e
    })
  }
}
