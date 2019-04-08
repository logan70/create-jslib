const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const execa = require('execa')
const inquirer = require('inquirer')
const Prompter = require('./Prompter')
const Generator = require('./Generator')
const cloneDeep = require('lodash.clonedeep')
const sortObject = require('./util/sortObject')
const { installDeps } = require('./util/installDeps')
const writeFileTree = require('./util/writeFileTree')
const generateReadme = require('./util/generateReadme')
const { clearConsole } = require('./util')
const {
  log,
  warn,
  hasGit,
  hasProjectGit,
  hasYarn,
  logWithSpinner,
  stopSpinner,
  loadModule
} = require('jslib-util')

const {
  defaultPreset,
  validatePreset
} = require('./options')

module.exports = class Creator {
  constructor (name, context) {
    this.name = name
    this.context = process.env.JSLIB_CONTEXT = context
    this.prompter = new Prompter()
    this.createCompleteCbs = []

    this.run = this.run.bind(this)
  }

  async create (cliOptions = {}, preset = null) {
    const isTestOrDebug = process.env.JSLIB_TEST || process.env.JSLIB_DEBUG
    const { run, name, context, createCompleteCbs } = this

    if (!preset) {
      if (cliOptions.default) {
        // create-jslib create foo --default
        preset = defaultPreset
      } else {
        preset = await this.promptAndResolvePreset()
      }
    }

    // clone before mutating
    preset = cloneDeep(preset)
    // inject core service
    preset.plugins['jslib-service'] = Object.assign({
      projectName: name
    }, preset)

    const packageManager = (
      cliOptions.packageManager ||
      preset.packageManager ||
      (hasYarn() ? 'yarn' : 'npm')
    )
    preset.packageManager && delete preset.packageManager
    debug('create-jslib:preset')(preset)

    logWithSpinner(`✨`, `Creating project in ${chalk.yellow(context)}.`)

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '1.0.0',
      devDependencies: {}
    }
    const deps = Object.keys(preset.plugins)
    deps.forEach(dep => {
      if (preset.plugins[dep]._isPreset) {
        return
      }

      pkg.devDependencies[dep] = preset.plugins[dep].version || 'latest'
    })

    // write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })

    // intilaize git repository before installing deps
    // so that vue-cli-service can setup git hooks.
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      logWithSpinner(`🗃`, `Initializing git repository...`)
      await run('git init')
    }

    // install plugins
    stopSpinner()
    log(`⚙  Installing CLI plugins. This might take a while...`)
    log()
    if (isTestOrDebug) {
      // in development, avoid installation process
      await require('./util/setupDevProject')(context)
    } else {
      await installDeps(context, packageManager, cliOptions.registry)
    }

    // run generator
    log(`🚀  Invoking generators...`)
    const plugins = await this.resolvePlugins(preset.plugins)
    const generator = new Generator(context, {
      pkg,
      plugins,
      completeCbs: createCompleteCbs
    })
    await generator.generate({
      extractConfigFiles: preset.useConfigFiles
    })

    // install additional deps (injected by generators)
    log(`📦  Installing additional dependencies...`)
    log()
    if (!isTestOrDebug) {
      await installDeps(context, packageManager, cliOptions.registry)
    }

    // run complete cbs if any (injected by generators)
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of createCompleteCbs) {
      await cb()
    }

    // generate README.md
    stopSpinner()
    log()
    logWithSpinner('📄', 'Generating README.md...')
    if (!fs.existsSync(path.resolve(context, 'README.md'))) {
      await writeFileTree(context, {
        'README.md': generateReadme(generator.pkg, packageManager)
      })
    }

    // commit initial state
    let gitCommitFailed = false
    if (shouldInitGit) {
      await run('git add -A')
      const msg = typeof cliOptions.git === 'string' ? cliOptions.git : 'init'
      try {
        await run('git', ['commit', '-m', msg])
      } catch (e) {
        gitCommitFailed = true
      }
    }

    // log instructions
    stopSpinner()
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    log(
      `👉  Get started with the following commands:\n\n` +
      (this.context === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
      chalk.cyan(` ${chalk.gray('$')} ${packageManager === 'yarn' ? 'yarn dev' : 'npm run dev'}`)
    )
    log()

    if (gitCommitFailed) {
      warn(
        `Skipped git commit due to missing username and email in git config.\n` +
        `You will need to perform the initial commit yourself.\n`
      )
    }

    generator.printExitLogs()
  }

  run (command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }

  async promptAndResolvePreset (answers = null) {
    // prompt
    if (!answers) {
      await clearConsole()
      const prompts = this.prompter.resolveFinalPrompts()
      debug('create-jslib:prompts')(prompts)
      answers = await inquirer.prompt(prompts)
    }
    debug('create-jslib:answers')(answers)

    let preset
    if (answers.preset && answers.preset === 'default') {
      preset = defaultPreset
    } else {
      // manual
      preset = {
        useConfigFiles: answers.useConfigFiles === 'files',
        plugins: {},
        formats: ['umd']
      }
      answers.features = answers.features || []
      // run cb registered by prompt modules to finalize the preset
      this.prompter.promptCompleteCbs.forEach(cb => cb(answers, preset))
    }

    if (answers.packageManager) {
      preset.packageManager = answers.packageManager
    }

    // validate
    validatePreset(preset)

    return preset
  }

  // { id: options } => [{ id, apply, options }]
  async resolvePlugins (rawPlugins) {
    // ensure jslib-service is invoked first
    rawPlugins = sortObject(rawPlugins, ['jslib-service'], true)
    const plugins = []
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.context) || (() => {})
      let options = rawPlugins[id] || {}
      if (options.prompts) {
        const prompts = loadModule(`${id}/prompts`, this.context)
        if (prompts) {
          log()
          log(`${chalk.cyan(options._isPreset ? `Preset options:` : id)}`)
          options = await inquirer.prompt(prompts)
        }
      }
      plugins.push({ id, apply, options })
    }
    return plugins
  }

  shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }
    // --git
    if (cliOptions.forceGit) {
      return true
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }
}
