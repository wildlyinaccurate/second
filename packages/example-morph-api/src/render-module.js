import Promise from 'bluebird'
import { dirname } from 'path'
import HttpClient from 'bbc-http-client'
import proxyquire from 'proxyquire'
import Bundler from 'second-bundler'
import Renderer from 'second-renderer'
import Fetcher from 'second-fetcher'

import RuntimeDependencyManager from './shims/morph-require'
import makeContainer from './shims/morph-container'
import morphDataObjectToUrl from './shims/morph-data-object-to-url'
import getRendererLib from './get-renderer-lib'

const DEFAULT_RENDERER_LIB = 'preact-compat'
const [VDom, VDomServer] = getRendererLib(DEFAULT_RENDERER_LIB)

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })
const wrapStyle = style => `<style>${style}</style>`

const client = new HttpClient({ timeout: 10000 })

const fetcher = new Fetcher({
  handlers: [morphDataObjectToUrl],
  request: (url) => client.get({
    url,
    json: true,
    resolveWithFullResponse: true,
    simple: false
  })
})

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
  componentIsReady: () => !fetcher.hasOutstandingRequests()
})

const loadComponent = componentModule => {
  return proxyquire.noCallThru()(componentModule, {
    'morph-container': makeGlobal(makeContainer(VDom, fetcher)),
    'morph-require': dependencyManager,
    'react': makeGlobal(VDom)
  })
}

export default function renderModuleIntoEnvelope (module, params) {
  [renderer.VDom, renderer.VDomServer] = getRendererLib(params['@@renderer'] || DEFAULT_RENDERER_LIB)

  const Component = loadComponent(module)
  const renderFn = params['@@static'] ? 'renderStatic' : 'render'

  // Load the module and its dependency tree into the require cache otherwise
  // the morph-require shim doesn't work
  require(module)

  const moduleRoot = dirname(require.resolve(`${module}/package.json`))

  return Promise.all([
    renderer[renderFn](Component, params),
    bundler.getStyles(moduleRoot)
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

function getRuntimeDependencyStyles () {
  const runtimeStyles = dependencyManager.mapDependencies(path => bundler.getStylesFrom(`${path}/public`))

  const runtimeSubfolderStyles = dependencyManager.mapSubfolderDependencies(path => {
    const pathParts = path.split('/')
    const subfolder = pathParts.pop()

    return bundler.getStylesFrom(`${pathParts.join('/')}/public/${subfolder}`)
  })

  return Promise.all(runtimeStyles.concat(runtimeSubfolderStyles))
}
