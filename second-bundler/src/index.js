import Promise from 'bluebird'
import fs from 'fs'
import { _resolveFilename } from 'module'
import { dirname } from 'path'

const { readFileAsync, statAsync } = Promise.promisifyAll(fs)

export function getStyles (module) {
  // Avoid a race condition with the renderer by ensuring the module is in
  // the require cache.
  require(module)

  const modulePkgPath = require.resolve(`${module}/package.json`)
  const moduleRoot = dirname(modulePkgPath)

  return recursivelyGetStyles(moduleRoot)
}

const emptyStyleAccumulator = () => ({
  core: [],
  enhanced: []
})

function recursivelyGetStyles (moduleRoot, acc = emptyStyleAccumulator()) {
  const modulePkg = require(`${moduleRoot}/package.json`)
  const coreCssPath = `${moduleRoot}/public/core.css`
  const enhancedCssPath = `${moduleRoot}/public/enhanced.css`

  return statAsync(enhancedCssPath)
    .then(() => [
      // Crudely assume that because enhanced.css exists, so too must core.css
      readFileAsync(coreCssPath, 'utf-8'),
      readFileAsync(enhancedCssPath, 'utf-8')
    ])
    .all()
    .spread((core, enhanced) => {
      acc.core.push(core)
      acc.enhanced.push(enhanced)
    })
    .then(() =>
      Object.keys(modulePkg.dependencies || {})
        .map(dep => recursivelyGetStyles(moduleRootFrom(dep, moduleRoot), acc))
    )
    .all()
    .then(() => acc)
    .catch(() => acc /* Unexpected; return the accumulator in its current state */)
}

function moduleRootFrom (module, from) {
  return dirname(
    _resolveFilename(`${module}/package.json`, require.cache[`${from}/package.json`])
  )
}
