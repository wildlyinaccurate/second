import Promise from 'bluebird'
import proxyquire from 'proxyquire'
import { propOr } from 'lodash/fp'
import { getStyles, getStylesFrom, mergeAccumulators } from 'second-bundler'

import getRendererLib from './renderer-lib'
import makeContainer from './container'
import Fetcher from './fetcher'
import RuntimeDependencyManager from './runtime-dependency-manager'

const DEFAULT_RENDERER_LIB = 'preact-compat'
const RERENDER_DELAY = 100

const makeGlobal = obj => Object.assign({}, obj, { '@global': true })

export default function render (componentModule, params) {
  const renderer = propOr(DEFAULT_RENDERER_LIB, '@@renderer', params)
  const [React, ReactDOMServer] = getRendererLib(renderer)

  const fetcher = new Fetcher()
  const container = makeContainer(React, fetcher)

  const dependencyManager = new RuntimeDependencyManager()
  dependencyManager['@global'] = true

  const Component = proxyquire.noCallThru()(componentModule, {
    'bbc-morph-grandstand': () => {},
    'morph-container': makeGlobal(container),
    'morph-require': dependencyManager,
    'react': makeGlobal(React)
  })

  return Promise.all([
      renderUntilComplete(React, ReactDOMServer, fetcher, Component, params),
      getStyles(componentModule)
    ]).spread((markup, styles) => [
      markup,
      styles,
      getRuntimeDependencyStyles(dependencyManager)
    ])
    .all()
    .spread((markup, styles, runtimeDependencyStyles) => ({
      markup,
      styles: mergeAccumulators(runtimeDependencyStyles, styles)
    }))
}

function renderUntilComplete (React, ReactDOMServer, fetcher, Component, params) {
  return new Promise((resolve, reject) => {
    const rendered = ReactDOMServer.renderToString(
      React.createElement(Component, params)
    )

    if (fetcher.hasOutstandingRequests()) {
      // Requests were made to the fetcher which have not yet been resolved
      return Promise.delay(RERENDER_DELAY).then(() => renderUntilComplete(React, ReactDOMServer, fetcher, Component, params))
    }

    resolve(rendered)
  }).catch(e => {
    if (fetcher.hasOutstandingRequests()) {
      // The error was potentially due to missing data in a downstream
      // component; try again
      return Promise.delay(RERENDER_DELAY).then(() => renderUntilComplete(React, ReactDOMServer, fetcher, Component, params))
    }

    throw e
  })
}

function getRuntimeDependencyStyles (dependencyManager) {
  const runtimeStyles = dependencyManager.mapDependencies(path => getStylesFrom(`${path}/public`))

  const runtimeSubfolderStyles = dependencyManager.mapSubfolderDependencies(path => {
    const pathParts = path.split('/')
    const subfolder = pathParts.pop()

    return getStylesFrom(`${pathParts.join('/')}/public/${subfolder}`)
  })

  return Promise.all([
      ...runtimeStyles,
      ...runtimeSubfolderStyles
    ])
    .then(styles => styles.reduce(mergeAccumulators, {}))
}
