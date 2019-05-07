const path = require('path')
const { matchesPluginId } = require('jslib-util')

// Note: if a plugin-registered command needs to run in a specific default mode,
// the plugin needs to expose it via `module.exports.defaultModes` in the form
// of { [commandName]: mode }. This is because the command mode needs to be
// known and applied before loading user options / applying plugins.

class PluginAPI {
  /**
   * @param {string} id - Id of the plugin.
   * @param {Service} service - A jslib-service instance.
   */
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  /**
   * Current working directory.
   */
  getCwd () {
    return this.service.context
  }

  /**
   * Resolve path for a project.
   *
   * @param {string} _path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve (_path) {
    return path.resolve(this.service.context, _path)
  }

  /**
   * Check if the project has a given plugin.
   *
   * @param {string} id - Plugin id, can omit the jslib-plugin- prefix
   * @return {boolean}
   */
  hasPlugin (id) {
    return this.service.plugins.some(p => matchesPluginId(id, p.id))
  }

  /**
   * Register a command that will become available as `jslib-service [name]`.
   *
   * @param {string} name
   * @param {object} [opts]
   *   {
   *     description: string,
   *     usage: string,
   *     options: { [string]: string }
   *   }
   * @param {function} fn
   *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
   */
  registerCommand (name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = { fn, opts: opts || {}}
  }

  /**
   * Register a function that will receive a rollup config
   * the function is lazy and won't be called until `resolveRollupConfig` is
   * called
   *
   * @param {function} fn
   */
  configureRollup (fn) {
    this.service.rollupConfigurer.push(fn)
  }

  /**
   * Register a function that will be called before rollup.rollup build.
   *
   * @param {function} desc - description
   * @param {function} fn
   */
  buildStart (desc, fn) {
    if (typeof desc === 'function') {
      fn = desc
      desc = 'Running custom hooks...'
    }
    this.service.buildStartHooks.push({
      desc,
      fn
    })
  }

  /**
   * Register a function that will be called once all bundle files have been written.
   *
   * @param {function} desc - description
   * @param {function} fn
   */
  buildEnd (desc, fn) {
    if (typeof desc === 'function') {
      fn = desc
      desc = 'Running custom hooks...'
    }
    this.service.buildEndHooks.push({
      desc,
      fn
    })
  }

  /**
   * Register a function that will be called before rebuilds.
   *
   * @param {function} desc - description
   * @param {function} fn
   */
  devStart (desc, fn) {
    if (typeof desc === 'function') {
      fn = desc
      desc = 'Running custom hooks...'
    }
    this.service.devStartHooks.push({
      desc,
      fn
    })
  }

  /**
   * Register a function that will be called once rebuild finished.
   *
   * @param {function} desc - description
   * @param {function} fn
   */
  devEnd (desc, fn) {
    if (typeof desc === 'function') {
      fn = desc
      desc = 'Running custom hooks...'
    }
    this.service.devEndHooks.push({
      desc,
      fn
    })
  }

  /**
   * Executing corresponding hooks.
   *
   * @param {function} desc - description
   * @param {function} fn
   */
  fireHooks (type, args, api, options, spinner) {
    const hookTypes = []
    for (const key in this.service) {
      if (this.service.hasOwnProperty(key)) {
        const result = /(\w*)Hooks/.exec(key)
        if (result && result[1]) {
          hookTypes.push(result[1])
        }
      }
    }
    if (!hookTypes.includes(type)) {
      return
    }
    return this.service[`${type}Hooks`].reduce((promise, { desc, fn }) => {
      promise = promise.then(async () => {
        if (spinner && desc) {
          spinner(desc)
        }
        await fn(args, api, options)
      })
    }, Promise.resolve())
  }
}

module.exports = PluginAPI
