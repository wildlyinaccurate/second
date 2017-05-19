import caller from 'caller'
import { _resolveFilename } from 'module'
import { dirname } from 'path'

export default class RuntimeDependencyManager {
  constructor () {
    this.dependencies = {}
    this.subFolderDependencies = {}
  }

  selfTransitiveThenUpdate (subfolder) {
    const callingModule = caller()

    if (!this.subFolderDependencies[callingModule]) {
      this.subFolderDependencies[callingModule] = relativeModuleFrom(subfolder, callingModule)
    }
  }

  transitiveThenUpdate (module) {
    if (!this.dependencies[module]) {
      this.dependencies[module] = moduleRootFrom(module, caller())
    }
  }

  mapDependencies (fn) {
    return Object.values(this.dependencies).map(fn)
  }

  mapSubfolderDependencies (fn) {
    return Object.values(this.subFolderDependencies).map(fn)
  }
}

function relativeModuleFrom (module, from) {
  // Assume that the "from" module root is the directory immediately following
  // the final "node_modules/".
  const fromRoot = from.match(/(.+node_modules\/[^/]+)\/.+/)[1]

  return `${fromRoot}/${module}`
}

function moduleRootFrom (module, from) {
  return dirname(
    _resolveFilename(`${module}/package.json`, require.cache[from])
  )
}
