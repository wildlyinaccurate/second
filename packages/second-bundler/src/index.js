import Promise from 'bluebird'
import fs from 'fs'
import debug from 'debug'
import { _resolveFilename } from 'module'
import { dirname } from 'path'
import { map, trim } from 'lodash/fp'

const log = debug('second:bundler')
const { readFileAsync, statAsync } = Promise.promisifyAll(fs)

// Data structure used to store component styles
const styleAccumulator = (core, enhanced) => ({
  core: [].concat(core || []),
  enhanced: [].concat(enhanced || [])
})

// Merge the second accumulator into the first by modifying the first
const _mergeAccumulators = (acc1, acc2) => Object.assign(acc1, {
  core: [...acc2.core, ...acc1.core],
  enhanced: [...acc2.enhanced, ...acc1.enhanced]
})

export default class Bundler {
  constructor ({ excludeModules = [] }) {
    this.excludeModules = excludeModules
  }

  // Immutable version of _mergeAccumulators
  mergeAccumulators (acc1, acc2) {
    return _mergeAccumulators(Object.assign({}, acc1), acc2)
  }

  getStyles (moduleRoot) {
    const modulePkgPath = `${moduleRoot}/package.json`
    const modulePkg = require(modulePkgPath)

    log(`Getting styles for ${modulePkg.name}`)

    return this.recursivelyGetStyles(moduleRoot)
      .tap(() => log(`All styles resolved for ${modulePkg.name}`))
  }

  getStylesFrom (directory) {
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

  recursivelyGetStyles (moduleRoot, acc = styleAccumulator()) {
    const modulePkg = require(`${moduleRoot}/package.json`)

    if (this.excludeModules.includes(modulePkg.name)) {
      log(`Ignoring ${modulePkg.name}`)
      return Promise.resolve(acc)
    }

    return this.getStylesFrom(`${moduleRoot}/public`)
      .then(styles => _mergeAccumulators(acc, styles))
      .then(() =>
        Object.keys(modulePkg.dependencies || {})
          .map(dep => this.recursivelyGetStyles(this.moduleRootFrom(dep, moduleRoot), acc))
      )
      .all()
      .then(() => acc)
      .catch(() => acc /* Unexpected; return the accumulator in its current state */)
  }

  moduleRootFrom (module, from) {
    return dirname(
      _resolveFilename(`${module}/package.json`, require.cache[`${from}/package.json`])
    )
  }
}
