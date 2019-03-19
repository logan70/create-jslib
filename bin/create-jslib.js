#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version
const { checkNodeVersion } = require('jslib-util')

const requiredVersion = require('../package.json').engines.node

checkNodeVersion(requiredVersion, 'jslib-cli')

const chalk = require('chalk')
const program = require('commander')
const minimist = require('minimist')

program
  .version(require('../package').version)
  .usage('<command> [options]')

  program
  .version(require('../package').version)
  .usage('<command> [options]')

// create-jslib create <lib-name>
// 初始化一个JS库开发项目
program
  .command('create <lib-name>')
  .description('create a new project powered by jslib-service')
  // 使用默认配置 babel + eslint
  .option('-d, --default', 'Skip prompts and use default preset')
  // 选择安装依赖的包管理工具 yarn or npm
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  // 设置安装依赖的源，仅npm可用，例如国内可以使用淘宝源
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  // 设置初次提交的git信息，传false代表不执行git init
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  // 跳过git init
  .option('-n, --no-git', 'Skip git initialization')
  // 如果项目目标文件夹存在，强制覆盖
  .option('-f, --force', 'Overwrite target directory if it exists')
  // 命令行使用代理，例如公司内网时
  .option('-x, --proxy', 'Use specified proxy when creating project')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    // create-jslib create foo bar
    // 传入项目名多于一个，使用第一个作为项目名
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the library\'s name, the rest are ignored.'))
    }
    // --git参数存在，则强制进行git初始化
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })


  program
  // create-jslib info
  // 输出当前用户环境信息
  .command('info')
  .description('print information about your environment')
  .action((cmd) => {
    console.log(chalk.bold('\nEnvironment Info:'))
    require('envinfo').run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'Yarn', 'npm'],
        Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        npmPackages: '/**/{typescript,*jslib*,@jslib/*/}',
        npmGlobalPackages: ['@jslib/cli']
      },
      {
        showNotFound: true,
        duplicates: true,
        fullTree: true
      }
    ).then(console.log)
  })

// create-jslib foo
// 不使用create命令，直接传入项目名，视为初始化项目
program
  .arguments('<command>')
  .description('create a new project powered by jslib-cli-service')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('-x, --proxy', 'Use specified proxy when creating project')
  .action((name, cmd) => {
    console.log(cmd)
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the library\'s name, the rest are ignored.'))
    }
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })

// 输出帮助信息
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`create-jslib <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// 命令行参数错误处理
const { enhanceErrorMessages } = require('../lib/util/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv)



if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// commander 传入参数只保留有用的配置
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
