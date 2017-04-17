import Promise from 'bluebird'
import fs from 'fs'
import { _resolveFilename } from 'module'
import { dirname } from 'path'
import { map, trim } from 'lodash/fp'

const { readFileAsync, statAsync } = Promise.promisifyAll(fs)

const styleAccumulator = (core, enhanced) => ({
  core: [].concat(core || []),
  enhanced: [].concat(enhanced || [])
})

// Merge the second accumulator into the first by modifying the first
const _mergeAccumulators = (acc1, acc2) => Object.assign(acc1, {
  core: [...acc2.core, ...acc1.core],
  enhanced: [...acc2.enhanced, ...acc1.enhanced]
})

// Immutable version of _mergeAccumulators
export function mergeAccumulators (acc1, acc2) {
  return _mergeAccumulators(Object.assign({}, acc1), acc2)
}

export function getStyles (module) {
  // Avoid a race condition with the renderer by ensuring the module is in
  // the require cache.
  require(module)

  const modulePkgPath = require.resolve(`${module}/package.json`)
  const moduleRoot = dirname(modulePkgPath)

  return recursivelyGetStyles(moduleRoot)
}

export function getStylesFrom (moduleRoot) {
  const coreCssPath = `${moduleRoot}/public/core.css`
  const enhancedCssPath = `${moduleRoot}/public/enhanced.css`

  return statAsync(enhancedCssPath)
    .then(() => [
      // Crudely assume that because enhanced.css exists, so too must core.css
      readFileAsync(coreCssPath, 'utf-8'),
      readFileAsync(enhancedCssPath, 'utf-8')
    ])
    .all()
    .then(map(trim))
    .spread(styleAccumulator)
    .catch(() => {} /* No second-compatible styles in this module */)
}

function recursivelyGetStyles (moduleRoot, acc = styleAccumulator()) {
  const modulePkg = require(`${moduleRoot}/package.json`)

  return getStylesFrom(moduleRoot)
    .then(styles => _mergeAccumulators(acc, styles))
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
