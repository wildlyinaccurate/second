import * as Promise from 'bluebird'
import proxyquire from 'proxyquire'
import * as Bundler from 'second-bundler'

import makeContainer from './container'
import Fetcher from './fetcher'
import RuntimeDependencyManager from './runtime-dependency-manager'

const RERENDER_DELAY = 100

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })

export default class Renderer {
  VDom: VDOMLibrary
  VDomRenderer: VDOMRenderer
  fetcher: Fetcher
  container: any

  constructor ({ VDom, VDomRenderer }) {
    this.VDom = VDom
    this.VDomRenderer = VDomRenderer

    this.fetcher = new Fetcher()
    this.container = makeContainer(VDom, this.fetcher)
  }

  render (componentModule, params) {
    const dependencyManager = new RuntimeDependencyManager()
    dependencyManager['@global'] = true

    const Component = proxyquire.noCallThru()(componentModule, {
      'bbc-morph-grandstand': () => {},
      'morph-container': makeGlobal(this.container),
      'morph-require': dependencyManager,
      'react': makeGlobal(this.VDom)
    })

    return Promise.all([
      this.renderUntilComplete(Component, params),
      Bundler.getStyles(componentModule)
    ])
      .spread((markup, styles) => [
        markup,
        styles,
        getRuntimeDependencyStyles(dependencyManager)
      ])
      .all()
      .spread((markup, styles, runtimeDependencyStyles) => ({
        markup,
        styles: runtimeDependencyStyles.reduce(Bundler.mergeAccumulators, styles)
      }))
  }

  renderUntilComplete (Component, params) {
    return new Promise((resolve, reject) => {
      const rendered = this.VDomRenderer.renderToString(
        this.VDom.createElement(Component, params)
      )

      if (this.fetcher.hasOutstandingRequests()) {
        // Requests were made to the fetcher which have not yet been resolved
        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(Component, params))
      }

      resolve(rendered)
    }).catch(e => {
      if (this.fetcher.hasOutstandingRequests()) {
        // The error was potentially due to missing data in a downstream
        // component; try again
        return Promise.delay(RERENDER_DELAY).then(() => this.renderUntilComplete(Component, params))
      }

      throw e
    })
  }
}

function getRuntimeDependencyStyles (dependencyManager): Promise<Bundler.StyleAccumulator[]> {
  const runtimeStyles = dependencyManager.mapDependencies(path => Bundler.getStylesFrom(`${path}/public`))

  const runtimeSubfolderStyles = dependencyManager.mapSubfolderDependencies(path => {
    const pathParts = path.split('/')
    const subfolder = pathParts.pop()

    return Bundler.getStylesFrom(`${pathParts.join('/')}/public/${subfolder}`)
  })

  return Promise.all(runtimeStyles.concat(runtimeSubfolderStyles))
}
