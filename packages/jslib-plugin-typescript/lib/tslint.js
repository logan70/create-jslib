const fs = require('fs')
const path = require('path')
const globby = require('globby')
const { done, log, exit, chalk } = require('jslib-util')
module.exports = async function lint (args = {}, api) {
  const cwd = api.resolve('.')
  const tslint = require('tslint')

  const options = {
    fix: args['fix'] === true,
    formatter: args.format || 'codeFrame',
    formattersDirectory: args['formatters-dir'],
    rulesDirectory: args['rules-dir']
  }

  const linter = new tslint.Linter(options)

  const tslintConfigPath = tslint.Configuration.CONFIG_FILENAMES
    .map(filename => api.resolve(filename))
    .find(file => fs.existsSync(file))

  const config = tslint.Configuration.findConfiguration(tslintConfigPath).results

  const files = args._ && args._.length
    ? args._
    : ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts', 'tests/**/*.tsx', '__tests__/**/*.ts', '__tests__/**/*.tsx']

  // respect linterOptions.exclude from tslint.json
  if (config.linterOptions && config.linterOptions.exclude) {
    // use the raw tslint.json data because config contains absolute paths
    const rawTslintConfig = tslint.Configuration.readConfigurationFile(tslintConfigPath)
    const excludedGlobs = rawTslintConfig.linterOptions.exclude
    excludedGlobs.forEach((g) => files.push('!' + g))
  }

  const filesToLint = await globby(files, { cwd })

  filesToLint.forEach(file => {
    const filePath = api.resolve(file)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    linter.lint(
      // append .ts so that tslint apply TS rules
      filePath,
      fileContents,
      config
    )
  })

  if (args.slient === true) {
    return
  }

  const result = linter.getResult()

  const hasFixed = result.fixes.length > 0
  const maxErrors = args.maxErrors || 0
  const maxWarnings = typeof args.maxWarnings === 'number' ? args.maxWarnings : Infinity
  const isErrorsExceeded = result.errorCount > maxErrors
  const isWarningsExceeded = result.warningCount > maxWarnings

  if (args.silent) {
    return !!((result.warningCount || result.errorCount))
  }

  if (!isErrorsExceeded && !isWarningsExceeded) {
    if (hasFixed) {
      log(`The following files have been auto-fixed:`)
      log()
      result.fixes.forEach(f => {
        if (f.fileName) {
          log(`  ${chalk.blue(path.relative(cwd, f.fileName))}`)
        }
      })
      log()
    }
    if (result.warningCount || result.errorCount) {
      log(formatLintResult(result))
      return true
    } else {
      !api.service.mode && done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
      return false
    }
  } else {
    log(formatLintResult(result))
    if (isErrorsExceeded && typeof args.maxErrors === 'number') {
      log(`Tslint found too many errors (maximum: ${args.maxErrors}).`)
    }
    if (isWarningsExceeded) {
      log(`Tslint found too many warnings (maximum: ${args.maxWarnings}).`)
    }
    exit(1)
  }
}

function formatLintResult (result) {
  let resultString = '\n' + result.output + '\n'

  const eNum = result.errorCount || 0
  const wNum = result.warningCount || 0
  resultString += (eNum || wNum)
    ? chalk.bold.red(`${
      (eNum ? eNum + ' error' + (eNum > 1 ? 's' : '') : '') +
      (eNum && wNum ? ' and ' : '') +
      (wNum ? wNum + ' warning' + (wNum > 1 ? 's' : '') : '') +
      ' found.\n'
    }`)
    : ''

  const failNumCanBeFixed = result.failures.filter(fail => fail.fix).length
  resultString += failNumCanBeFixed
    ? chalk.bold.red(`${failNumCanBeFixed} error${failNumCanBeFixed > 1 ? 's' : ''} potentially fixable with the \`--fix\` option.`)
    : ''

  return resultString
}
