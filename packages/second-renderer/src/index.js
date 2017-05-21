import Promise from 'bluebird'
import debug from 'debug'

const RERENDER_DELAY = 100
const log = debug('second:renderer')

export default class Renderer {
  constructor ({ VDom, VDomServer, componentIsReady = () => true }) {
    this.VDom = VDom
    this.VDomServer = VDomServer
    this.componentIsReady = componentIsReady
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
    log(`Starting render of ${Component.displayName}`)

    return new Promise((resolve, reject) => {
      const rendered = render(
        this.VDom.createElement(Component, params)
      )

      if (!this.componentIsReady()) {
        log(`Component is not ready. Trying again in ${delayTime}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(render, Component, params))
      }

      log(`Completed render of ${Component.displayName}`)
      resolve(rendered)
    }).catch(e => {
      if (!this.componentIsReady()) {
        log(`Error thrown by ${Component.displayName}, but component is not ready. Trying again in ${delayTime}ms.`)

        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(render, Component, params))
      }

      throw e
    })
  }
}
