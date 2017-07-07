import containerFactory from 'second-container'
import Fetcher from 'second-fetcher'
import Renderer from 'second-renderer'
import { createDehydrator } from 'second-dehydrator'

class Second {
  constructor () {
    this.initialised = false
  }

  init ({ VDom, VDomServer, fetcherOptions = {} }) {
    this.initialised = true

    this.fetcher = new Fetcher(fetcherOptions)

    this.containerFactory = containerFactory({
      Component: VDom.Component,
      createElement: VDom.createElement,
      fetcher: this.fetcher
    })

    this.dehydrate = createDehydrator(VDom.createElement)

    this.renderer = new Renderer({
      VDom,
      VDomServer,
      componentIsReady: () => !this.fetcher.hasOutstandingRequests()
    })
  }

  reset () {
    this.fetcher.reset()
  }

  createContainer (Component, params) {
    if (!this.initialised) {
      throw new Error('You must call second.init() before you can call second.createContainer().')
    }

    return this.containerFactory(Component, params)
  }

  render (Component, params) {
    if (!this.initialised) {
      throw new Error('You must call second.init() before you can call second.render().')
    }

    return this.renderer.render(Component, params)
  }

  renderStatic (Component, params) {
    if (!this.initialised) {
      throw new Error('You must call second.init() before you can call second.renderStatic().')
    }

    return this.renderer.renderStatic(Component, params)
  }
}

export default new Second()
