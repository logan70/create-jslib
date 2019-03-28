const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const readPkg = require('read-pkg')
const PluginAPI = require('./PluginAPI')
const RollupConfig = require('./RollupConfig')
const defaultsDeep = require('lodash.defaultsdeep')
const { warn, error } = require('jslib-util')

const { defaults, validate } = require('./options')

module.exports = class Service {
  constructor (context) {
    process.JSLIB_SERVICE = this
    this.initialized = false
    this.context = context
    this.commands = {}
    this.rollupChangeFns = []
    this.beforeFns = {}
    this.afterFns = {}
    // Folder containing the target package.json for plugins
    this.pkgContext = context
    // package.json containing the plugins
    this.pkg = this.resolvePkg()
    // If there are inline plugins, they will be used instead of those
    // found in package.json.
    // for testing.
    this.plugins = this.resolvePlugins()
    // resolve the default mode to use for each command
    // this is provided by plugins as module.exports.defaultModes
    // so we can get the information without actually applying the plugin.
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }

  resolvePkg (context = this.context) {
    if (fs.existsSync(path.join(context, 'package.json'))) {
      const pkg = readPkg.sync({ cwd: context })
      return pkg
    } else {
      return {}
    }
  }

  init (mode = process.env.JSLIB_MODE) {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.mode = mode

    // load user config
    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults())

    debug('jslib:project-config')(this.projectOptions)

    // apply plugins.
    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })
  }

  resolvePlugins () {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    let plugins

    const builtInPlugins = [
      './commands/dev',
      './commands/build',
      './commands/help',
    ].map(idToPlugin)

    const pluginRE = /jslib-plugin-/
    const isPlugin = id => pluginRE.test(id)
    const projectPlugins = Object.keys(this.pkg.devDependencies || {})
      .concat(Object.keys(this.pkg.dependencies || {}))
      .filter(isPlugin)
      .map(id => idToPlugin(id))
    plugins = builtInPlugins.concat(projectPlugins)

    return plugins
  }

  async run (name, args = {}) {
    // resolve mode
    // prioritize inline --mode
    // fallback to resolved default modes from plugins or development if --watch is defined
    const mode = args.mode || this.modes[name]

    // load env variables, load user config, apply plugins
    this.init(mode)

    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
    }
    
    const { fn } = command
    if (name === 'dev') {
      return fn(args)
    }
    if (this.beforeFns[name] && this.beforeFns[name].length) {
      for (const beforeFn of this.beforeFns[name]) {
        await beforeFn(args)
      }
    }
    const result = await fn(args)
    if (this.afterFns[name] && this.afterFns[name].length) {
      for (const afterFn of this.afterFns[name]) {
        await afterFn(args)
      }
    }
    return result
  }

  loadUserOptions () {
    // jslib.config.js
    let fileConfig, pkgConfig, resolved, resolvedFrom
    const configPath = path.resolve(this.context, 'jslib.config.js')
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)
        if (!fileConfig || typeof fileConfig !== 'object') {
          error(
            `Error loading ${chalk.bold('jslib.config.js')}: should export an object.`
          )
          fileConfig = null
        }
      } catch (e) {
        error(`Error loading ${chalk.bold('jslib.config.js')}:`)
        throw e
      }
    }

    // package.jslib
    pkgConfig = this.pkg.jslib
    if (pkgConfig && typeof pkgConfig !== 'object') {
      error(
        `Error loading jslib-service config in ${chalk.bold(`package.json`)}: ` +
        `the "jslib" field should be an object.`
      )
      pkgConfig = null
    }

    if (fileConfig) {
      if (pkgConfig) {
        warn(
          `"jslib" field in package.json ignored ` +
          `due to presence of ${chalk.bold('jslib.config.js')}.`
        )
        warn(
          `You should migrate it into ${chalk.bold('jslib.config.js')} ` +
          `and remove it from package.json.`
        )
      }
      resolved = fileConfig
      resolvedFrom = 'jslib.config.js'
    } else if (pkgConfig) {
      resolved = pkgConfig
      resolvedFrom = '"jslib" field in package.json'
    } else {
      resolved = {}
      resolvedFrom = 'null'
    }

    // normalize some options
    removeSlash(resolved, 'outputDir')

    // validate options
    validate(resolved, msg => {
      error(
        `Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`
      )
    })

    return resolved
  }

  resolveRollupConfig(format = 'umd', args = {}, api = {}, options = {}) {
    let rollupConfig = new RollupConfig(format, args, api, options)
    this.rollupChangeFns.forEach(fn => fn(rollupConfig))
    return {
      inputOption: rollupConfig.getInputOption(),
      outputOption: rollupConfig.getOutputOption()
    }
  }
}

function ensureSlash (config, key) {
  let val = config[key]
  if (typeof val === 'string') {
    if (!/^https?:/.test(val)) {
      val = val.replace(/^([^/.])/, '/$1')
    }
    config[key] = val.replace(/([^/])$/, '$1/')
  }
}

function removeSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/\/$/g, '')
  }
}
