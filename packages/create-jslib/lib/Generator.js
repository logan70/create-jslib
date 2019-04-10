const ejs = require('ejs')
const debug = require('debug')
const GeneratorAPI = require('./GeneratorAPI')
const sortObject = require('./util/sortObject')
const writeFileTree = require('./util/writeFileTree')
const normalizeFilePaths = require('./util/normalizeFilePaths')
const ConfigTransform = require('./ConfigTransform')
const { matchesPluginId } = require('./util/pluginResolution')

const logger = require('jslib-util')
const logTypes = {
  log: logger.log,
  info: logger.info,
  done: logger.done,
  warn: logger.warn,
  error: logger.error
}

const defaultConfigTransforms = {
  babel: new ConfigTransform({
    file: {
      js: ['babel.config.js']
    }
  }),
  eslintConfig: new ConfigTransform({
    file: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      yaml: ['.eslintrc.yaml', '.eslintrc.yml']
    }
  }),
  jest: new ConfigTransform({
    file: {
      js: ['jest.config.js']
    }
  }),
  browserslist: new ConfigTransform({
    file: {
      lines: ['.browserslistrc']
    }
  })
}

const reservedConfigTransforms = {
  jslib: new ConfigTransform({
    file: {
      js: ['jslib.config.js']
    }
  })
}

const ensureEOL = str => {
  if (str.charAt(str.length - 1) !== '\n') {
    return str + '\n'
  }
  return str
}

module.exports = class Generator {
  constructor (context, {
    pkg = {},
    plugins = [],
    completeCbs = [],
    files = {},
    invoking = false
  } = {}) {
    this.context = context
    this.plugins = plugins
    this.originalPkg = pkg
    this.pkg = Object.assign({}, pkg)
    this.imports = {}
    this.rootOptions = {}
    this.completeCbs = completeCbs
    this.configTransforms = {}
    this.defaultConfigTransforms = defaultConfigTransforms
    this.reservedConfigTransforms = reservedConfigTransforms
    this.invoking = invoking
    // for conflict resolution
    this.depSources = {}
    // virtual file tree
    this.files = files
    this.fileMiddlewares = []
    this.postProcessFilesCbs = []
    // exit messages
    this.exitLogs = []

    // apply generators from plugins
    plugins.forEach(({ id, apply, options }) => {
      const api = new GeneratorAPI(id, this, options)
      apply(api, options, invoking)
    })
  }

  async generate ({
    extractConfigFiles = false,
    checkExisting = false
  } = {}) {
    // save the file system before applying plugin for comparison
    const initialFiles = Object.assign({}, this.files)
    // extract configs from package.json into dedicated files.
    this.extractConfigFiles(extractConfigFiles, checkExisting)
    // wait for file resolve
    await this.resolveFiles()
    // set package.json
    this.sortPkg()
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
    // write/update file tree to disk
    await writeFileTree(this.context, this.files, initialFiles)
  }

  extractConfigFiles (extractAll, checkExisting) {
    const configTransforms = Object.assign({},
      defaultConfigTransforms,
      this.configTransforms,
      reservedConfigTransforms
    )
    const extract = key => {
      if (
        configTransforms[key] &&
        this.pkg[key] &&
        // do not extract if the field exists in original package.json
        !this.originalPkg[key]
      ) {
        const value = this.pkg[key]
        const configTransform = configTransforms[key]
        const res = configTransform.transform(
          value,
          checkExisting,
          this.files,
          this.context
        )
        const { content, filename } = res
        this.files[filename] = ensureEOL(content)
        delete this.pkg[key]
      }
    }
    if (extractAll) {
      for (const key in this.pkg) {
        extract(key)
      }
    } else {
      if (!process.env.JSLIB_TEST) {
        // by default, always extract jslib.config.js
        extract('jslib')
      }
      // always extract babel.config.js as this is the only way to apply
      // project-wide configuration even to dependencies.
      // TODO: this can be removed when Babel supports root: true in package.json
      extract('babel')
    }
  }

  sortPkg () {
    // ensure package.json keys has readable order
    this.pkg.dependencies = sortObject(this.pkg.dependencies)
    this.pkg.devDependencies = sortObject(this.pkg.devDependencies)
    this.pkg.scripts = sortObject(this.pkg.scripts, [
      'dev',
      'build',
      'test',
      'lint',
      'doc'
    ])
    this.pkg = sortObject(this.pkg, [
      'name',
      'version',
      'private',
      'description',
      'author',
      'scripts',
      'main',
      'module',
      'browser',
      'jsDelivr',
      'unpkg',
      'files',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'jslib',
      'babel',
      'eslintConfig',
      'prettier',
      'jest'
    ])

    debug('create-jslib:pkg')(this.pkg)
  }

  async resolveFiles () {
    const files = this.files
    for (const middleware of this.fileMiddlewares) {
      await middleware(files, ejs.render)
    }

    // normalize file paths on windows
    // all paths are converted to use / instead of \
    normalizeFilePaths(files)

    for (const postProcess of this.postProcessFilesCbs) {
      await postProcess(files)
    }

    debug('create-jslib:files')(this.files)
  }

  hasPlugin (_id) {
    return [
      ...this.plugins.map(p => p.id),
      ...Object.keys(this.pkg.devDependencies || {}),
      ...Object.keys(this.pkg.dependencies || {})
    ].some(id => matchesPluginId(_id, id))
  }

  printExitLogs () {
    if (this.exitLogs.length) {
      this.exitLogs.forEach(({ id, msg, type }) => {
        const logFn = logTypes[type]
        if (!logFn) {
          logger.error(`Invalid api.exitLog type '${type}'.`)
        } else {
          logFn(msg)
        }
      })
      logger.log()
    }
  }
}
