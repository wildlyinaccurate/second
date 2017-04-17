import * as Promise from 'bluebird'
import * as fs from 'fs'
import { _resolveFilename } from 'module'
import { dirname } from 'path'
import { map, trim } from 'lodash/fp'

const { readFileAsync, statAsync }: any = Promise.promisifyAll(fs)

const EXCLUDE_MODULES = ['bbc-morph-grandstand']

interface StyleAccumulator {
  core: string[]
  enhanced: string[]
}

const styleAccumulator = (core?: string, enhanced?: string): StyleAccumulator => ({
  core: core ? [core] : [],
  enhanced: enhanced ? [enhanced] : []
})

// Merge the second accumulator into the first by modifying the first
const _mergeAccumulators = (acc1: StyleAccumulator, acc2: StyleAccumulator): StyleAccumulator => Object.assign(acc1, {
  core: [...acc2.core, ...acc1.core],
  enhanced: [...acc2.enhanced, ...acc1.enhanced]
})

// Immutable version of _mergeAccumulators
export function mergeAccumulators (acc1: StyleAccumulator, acc2: StyleAccumulator) {
  return _mergeAccumulators(Object.assign({}, acc1), acc2)
}

export function getStyles (module: string): Promise<StyleAccumulator> {
  // Avoid a race condition with the renderer by ensuring the module is in
  // the require cache.
  require(module)

  const modulePkgPath = require.resolve(`${module}/package.json`)
  const moduleRoot = dirname(modulePkgPath)

  return recursivelyGetStyles(moduleRoot)
}

export function getStylesFrom (directory: string): Promise<StyleAccumulator> {
  const coreCssPath = `${directory}/core.css`
  const enhancedCssPath = `${directory}/enhanced.css`

  return statAsync(enhancedCssPath)
    .then(() => [
      // Crudely assume that because enhanced.css exists, so too must core.css
      readFileAsync(coreCssPath, 'utf-8'),
      readFileAsync(enhancedCssPath, 'utf-8')
    ])
    .all()
    .then(map(trim))
    .spread(styleAccumulator)
    .catch(styleAccumulator /* No second-compatible styles in this module */)
}

function recursivelyGetStyles (moduleRoot: string, acc = styleAccumulator()): Promise<StyleAccumulator> {
  const modulePkg = require(`${moduleRoot}/package.json`)

  // Traversing the dependency tree results in all grandstand variants being
  // bundled. Probably a more sensible approach is to hook into require() and
  // only bundle modules that are actually used.
  if (EXCLUDE_MODULES.includes(modulePkg.name)) {
    return Promise.resolve(acc)
  }

  return getStylesFrom(`${moduleRoot}/public`)
    .then(styles => _mergeAccumulators(acc, styles))
    .then(() =>
      Object.keys(modulePkg.dependencies || {})
        .map(dep => recursivelyGetStyles(moduleRootFrom(dep, moduleRoot), acc))
    )
    .all()
    .then(() => acc)
    .catch(() => acc /* Unexpected; return the accumulator in its current state */)
}

function moduleRootFrom (module: string, from: string) {
  return dirname(
    _resolveFilename(`${module}/package.json`, require.cache[`${from}/package.json`])
  )
}
