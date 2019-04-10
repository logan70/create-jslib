const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const execa = require('execa')
const inquirer = require('inquirer')
const Generator = require('./Generator')
const cloneDeep = require('lodash.clonedeep')
const sortObject = require('./util/sortObject')
const { installDeps } = require('./util/installDeps')
const writeFileTree = require('./util/writeFileTree')
const generateReadme = require('./util/generateReadme')
const { clearConsole } = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const {
  log,
  error,
  warn,
  exit,
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

const isManualMode = answers => answers.preset === '__manual__'

module.exports = class Creator {
  constructor (name, context, promptModules) {
    this.name = name
    this.context = process.env.JSLIB_CONTEXT = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()
    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.createCompleteCbs = []

    this.packageManager = hasYarn() ? 'yarn' : 'npm'

    this.run = this.run.bind(this)

    const promptAPI = new PromptModuleAPI(this)
    promptModules.forEach(m => m(promptAPI))
  }

  async create (cliOptions = {}, preset = null) {
    const isTestOrDebug = process.env.JSLIB_TEST || process.env.JSLIB_DEBUG
    const { run, name, context, createCompleteCbs } = this

    if (!preset) {
      if (cliOptions.default) {
        // create-jslib create foo --default
        preset = defaultPreset
      } else if (cliOptions.inlinePreset) {
        // create-jslib create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset)
        } catch (e) {
          error(`CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`)
          exit(1)
        }
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
      this.packageManager
    )
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
    // so that jslib-service can setup git hooks.
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
      const prompts = this.resolveFinalPrompts()
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
        plugins: {}
      }
      answers.features = answers.features || []
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach(cb => cb(answers, preset))
    }

    this.packageManager = answers.packageManager || this.packageManager

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

  resolveIntroPrompts () {
    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        {
          name: `default (${chalk.yellow('babel')}, ${chalk.yellow('eslint')})`,
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: '__manual__'
        }
      ]
    }
    const featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10
    }
    return {
      presetPrompt,
      featurePrompt
    }
  }

  resolveOutroPrompts () {
    const outroPrompts = [{
      name: 'useConfigFiles',
      when: isManualMode,
      type: 'list',
      message: 'Where do you prefer placing config for Babel, PostCSS, ESLint, etc.?',
      choices: [
        {
          name: 'In dedicated config files',
          value: 'files'
        },
        {
          name: 'In package.json',
          value: 'pkg'
        }
      ]
    }]
    if (hasYarn()) {
      outroPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: [
          {
            name: 'Use Yarn',
            value: 'yarn',
            short: 'Yarn'
          },
          {
            name: 'Use NPM',
            value: 'npm',
            short: 'NPM'
          }
        ]
      })
    }

    return outroPrompts
  }

  resolveFinalPrompts () {
    // patch generator-injected prompts to only show in manual mode
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers)
      }
    })
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts
    ]
    return prompts
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
