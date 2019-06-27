const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const readPkg = require('read-pkg')
const PluginAPI = require('./PluginAPI')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const defaultsDeep = require('lodash.defaultsdeep')
const { warn, error, isPlugin, loadModule } = require('jslib-util')

const { defaults, validate } = require('./options')
const RollupConfig = require('./RollupConfig')

module.exports = class Service {
  constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
    process.JSLIB_SERVICE = this
    this.initialized = false
    this.context = context
    this.inlineOptions = inlineOptions
    this.rollupConfigurer = []
    this.buildStartHooks = []
    this.buildEndHooks = []
    this.devStartHooks = []
    this.devEndHooks = []
    this.beforeFns = {}
    this.afterFns = {}
    this.commands = {}
    // Folder containing the target package.json for plugins
    this.pkgContext = context
    // package.json containing the plugins
    this.pkg = this.resolvePkg(pkg)
    // If there are inline plugins, they will be used instead of those
    // found in package.json.
    // for testing.
    this.plugins = this.resolvePlugins(plugins, useBuiltIn)
    // resolve the default mode to use for each command
    // this is provided by plugins as module.exports.defaultModes
    // so we can get the information without actually applying the plugin.
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }

  resolvePkg (inlinePkg, context = this.context) {
    if (inlinePkg) {
      return inlinePkg
    } else if (fs.existsSync(path.join(context, 'package.json'))) {
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

    // load mode .env
    if (mode) {
      this.loadEnv(mode)
    }
    // load base .env
    this.loadEnv()

    // load user config
    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults(this.pkg))

    debug('jslib:project-config')(this.projectOptions)

    // apply plugins.
    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // apply rollup configs from project config file
    if (this.projectOptions.configureRollup) {
      this.rollupConfigurer.push(this.projectOptions.configureRollup)
    }
  }

  loadEnv (mode) {
    const logger = debug('jslib:env')
    const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = path => {
      try {
        const env = dotenv.config({ path, debug: process.env.DEBUG })
        dotenvExpand(env)
        logger(path, env)
      } catch (err) {
        // only ignore error if file is not found
        if (err.toString().indexOf('ENOENT') < 0) {
          error(err)
        }
      }
    }

    load(localPath)
    load(basePath)

    // by default, NODE_ENV and BABEL_ENV are set to "development" unless mode
    // is production or test. However the value in .env files will take higher
    // priority.
    if (mode) {
      // always set NODE_ENV during tests
      // as that is necessary for tests to not be affected by each other
      const shouldForceDefaultEnv = (
        process.env.JSLIB_TEST &&
        !process.env.JSLIB_TEST_TESTING_ENV
      )
      const defaultNodeEnv = (mode === 'production' || mode === 'test')
        ? mode
        : 'development'
      if (shouldForceDefaultEnv || process.env.NODE_ENV == null) {
        process.env.NODE_ENV = defaultNodeEnv
      }
      if (shouldForceDefaultEnv || process.env.BABEL_ENV == null) {
        process.env.BABEL_ENV = defaultNodeEnv
      }
    }
  }

  resolvePlugins (inlinePlugins, useBuiltIn) {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    let plugins

    const builtInPlugins = [
      './commands/dev',
      './commands/build',
      './commands/help'
    ].map(idToPlugin)

    if (inlinePlugins) {
      plugins = useBuiltIn !== false
        ? builtInPlugins.concat(inlinePlugins)
        : inlinePlugins
    } else {
      const projectPlugins = Object.keys(this.pkg.devDependencies || {})
        .concat(Object.keys(this.pkg.dependencies || {}))
        .filter(isPlugin)
        .map(id => idToPlugin(id))
      plugins = builtInPlugins.concat(projectPlugins)
    }

    // Local plugins
    if (this.pkg.jslibPlugins && this.pkg.jslibPlugins.service) {
      const files = this.pkg.jslibPlugins.service
      if (!Array.isArray(files)) {
        throw new Error(`Invalid type for option 'jslibPlugins.service', expected 'array' but got ${typeof files}.`)
      }
      plugins = plugins.concat(files.map(file => ({
        id: `local:${file}`,
        apply: loadModule(file, this.pkgContext)
      })))
    }

    return plugins
  }

  async run (name, args = {}, rawArgv = []) {
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
      rawArgv.shift()
    }

    const { fn } = command
    return fn(args, rawArgv)
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

  resolveRollupConfig (format = 'umd', args = {}, api = {}, options = {}) {
    const rollupConfig = new RollupConfig(format, args, api, options)
    this.rollupConfigurer.forEach(fn => fn(rollupConfig, format))
    return rollupConfig
  }
}

function removeSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/\/$/g, '')
  }
}
