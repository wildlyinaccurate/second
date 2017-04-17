import caller from 'caller'
import { _resolveFilename } from 'module'
import { dirname } from 'path'

export default class RuntimeDependencyManager {
  constructor() {
    this.dependencies = {}
  }

  selfTransitiveThenUpdate (module) {
  }

  transitiveThenUpdate (module) {
    if (!this.dependencies[module]) {
      this.dependencies[module] = moduleRootFrom(module, caller())
    }
  }

  mapDependencies (fn) {
    return Object.values(this.dependencies).map(fn)
  }
}

function moduleRootFrom (module, from) {
  return dirname(
    _resolveFilename(`${module}/package.json`, require.cache[from])
  )
}
