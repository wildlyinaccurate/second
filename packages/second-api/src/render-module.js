import Promise from 'bluebird'
import proxyquire from 'proxyquire'
import Bundler from 'second-bundler'
import Renderer from 'second-renderer'
import Fetcher from 'second-fetcher'

import RuntimeDependencyManager from './shims/morph-require'
import makeContainer from './shims/morph-container'
import getRendererLib from './get-renderer-lib'

const DEFAULT_RENDERER_LIB = 'preact-compat'
const [VDom, VDomServer] = getRendererLib(DEFAULT_RENDERER_LIB)

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })
const wrapStyle = style => `<style>${style}</style>`

const fetcher = new Fetcher()
const container = makeContainer(VDom, fetcher)

const bundler = new Bundler({
  // Traversing the dependency tree results in all grandstand variants being
  // bundled. Probably a more sensible approach is to hook into require() and
  // only bundle modules that are actually used.
  excludeModules: ['bbc-morph-grandstand']
})

const dependencyManager = new RuntimeDependencyManager()
dependencyManager['@global'] = true

const renderer = new Renderer({
  VDom,
  VDomServer,
  fetcher,

  // Morph-compatible shims
  loadComponent: function (componentModule) {
    return proxyquire.noCallThru()(componentModule, {
      'bbc-morph-grandstand': () => {},
      'morph-container': makeGlobal(container),
      'morph-require': dependencyManager,
      'react': makeGlobal(this.VDom)
    })
  }
})

export default function renderModuleIntoEnvelope (module, params) {
  [renderer.VDom, renderer.VDomServer] = getRendererLib(params['@@renderer'] || DEFAULT_RENDERER_LIB)

  return Promise.all([
    renderer.render(module, params),
    bundler.getStyles(module)
  ])
    .spread((markup, styles) => [
      markup,
      styles,
      getRuntimeDependencyStyles(dependencyManager)
    ])
    .all()
    .spread((markup, styles, runtimeDependencyStyles) => ({
      markup,
      styles: runtimeDependencyStyles.reduce(bundler.mergeAccumulators, styles)
    }))
    .then(component => ({
      head: component.styles.enhanced.map(wrapStyle),
      bodyInline: component.markup,
      bodyLast: []
    }))
}

function getRuntimeDependencyStyles (dependencyManager) {
  const runtimeStyles = dependencyManager.mapDependencies(path => bundler.getStylesFrom(`${path}/public`))

  const runtimeSubfolderStyles = dependencyManager.mapSubfolderDependencies(path => {
    const pathParts = path.split('/')
    const subfolder = pathParts.pop()

    return bundler.getStylesFrom(`${pathParts.join('/')}/public/${subfolder}`)
  })

  return Promise.all(runtimeStyles.concat(runtimeSubfolderStyles))
}
