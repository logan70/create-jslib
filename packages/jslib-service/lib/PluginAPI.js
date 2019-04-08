const path = require('path')
const { matchesPluginId } = require('jslib-util')

// Note: if a plugin-registered command needs to run in a specific default mode,
// the plugin needs to expose it via `module.exports.defaultModes` in the form
// of { [commandName]: mode }. This is because the command mode needs to be
// known and applied before loading user options / applying plugins.

class PluginAPI {
  /**
   * @param {string} id - Id of the plugin.
   * @param {Service} service - A vue-cli-service instance.
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
   * @param {string} id - Plugin id, can omit the (@vue/|vue-|@scope/vue)-cli-plugin- prefix
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
  changeRollup (fn) {
    this.service.rollupChangeFns.push(fn)
  }

  /**
   * Register a function that will receive args passed by user
   * the function will should be called in when register a command
   *
   * @param {String} mode - mode of command. e.g. 'build' 'dev'
   * @param {function} fn
   */
  addBeforeFn (mode, fn) {
    (this.service.beforeFns[mode] || (this.service.beforeFns[mode] = [])).push(fn)
  }

  /**
   * Register a function that will receive args passed by user
   * the function will should be called in when register a command
   *
   * @param {String} mode - mode of command. e.g. 'build' 'dev'
   * @param {function} fn
   */
  addAfterFn (mode, fn) {
    (this.service.afterFns[mode] || (this.service.afterFns[mode] = [])).push(fn)
  }

  async runBeforeFns (mode, args, api, options) {
    const beforeFns = this.service.beforeFns[mode]
    if (beforeFns && beforeFns.length) {
      for (const beforeFn of beforeFns) {
        await beforeFn(args, api, options)
      }
    }
  }

  async runAfterFns (mode, args, api, options) {
    const afterFns = this.service.afterFns[mode]
    if (afterFns && afterFns.length) {
      for (const afterFn of afterFns) {
        await afterFn(args, api, options)
      }
    }
  }
}

module.exports = PluginAPI
