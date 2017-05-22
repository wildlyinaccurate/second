import Promise from 'bluebird'
import debug from 'debug'

const INITIAL_RERENDER_DELAY = 100
const log = debug('second:renderer')

export default class Renderer {
  constructor ({ VDom, VDomServer, componentIsReady = () => true }) {
    this.VDom = VDom
    this.VDomServer = VDomServer
    this.componentIsReady = componentIsReady
  }

  reset () {
    this._reRenderDelay = INITIAL_RERENDER_DELAY
  }

  render (Component, params) {
    this.reset()

    return this.renderUntilComplete(
      this.VDomServer.renderToString,
      Component,
      params
    )
  }

  renderStatic (Component, params) {
    this.reset()

    return this.renderUntilComplete(
      this.VDomServer.renderToStaticMarkup,
      Component,
      params
    )
  }

  renderUntilComplete (render, Component, params) {
    log(`Starting render of ${Component.displayName}`)

    const delayTime = this.reRenderDelay()

    return new Promise((resolve, reject) => {
      const rendered = render(
        this.VDom.createElement(Component, params)
      )

      if (!this.componentIsReady()) {
        log(`Component is not ready. Trying again in ${delayTime}ms.`)

        resolve(Promise.delay(delayTime).then(() => this.renderUntilComplete(render, Component, params)))
      }

      log(`Completed render of ${Component.displayName}`)

      resolve(rendered)
    }).catch(e => {
      if (!this.componentIsReady()) {
        log(`Error thrown by ${Component.displayName}, but component is not ready. Trying again in ${delayTime}ms.`)

        return Promise.delay(delayTime).then(() => this.renderUntilComplete(render, Component, params))
      }

      throw e
    })
  }

  reRenderDelay () {
    const delay = this._reRenderDelay

    this._reRenderDelay = Math.ceil(this._reRenderDelay * 1.1)

    return delay
  }
}
