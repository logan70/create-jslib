const chalk = require('chalk')
const execa = require('execa')
const { hasYarn, request } = require('jslib-util')
const inquirer = require('inquirer')
const registries = require('./registries')

async function ping (registry) {
  await request.get(`${registry}/jslib-version-marker/latest`)
  return registry
}

function removeSlash (url) {
  return url.replace(/\/$/, '')
}

let checked
let result

module.exports = async function shouldUseTaobao (command) {
  if (!command) {
    command = hasYarn() ? 'yarn' : 'npm'
  }

  // ensure this only gets called once.
  if (checked) return result
  checked = true

  let userCurrent
  await Promise.race([
    execa(command, ['config', 'get', 'registry']),
    new Promise(resolve => {
      setTimeout(resolve, 3000)
    })
  ]).then(({ stdout, a }) => {
    userCurrent = stdout
  }).catch(() => {})

  const defaultRegistry = registries[command]

  if (userCurrent && removeSlash(userCurrent) !== removeSlash(defaultRegistry)) {
    // user has configured custom registry, respect that
    return false
  }

  let faster
  try {
    faster = await Promise.race([
      ping(defaultRegistry),
      ping(registries.taobao)
    ])
  } catch (e) {
    return false
  }

  if (faster !== registries.taobao) {
    // default is already faster
    return false
  }

  // ask and save preference
  const { useTaobaoRegistry } = await inquirer.prompt([
    {
      name: 'useTaobaoRegistry',
      type: 'confirm',
      message: chalk.yellow(
        ` Your connection to the default ${command} registry seems to be slow.\n` +
          `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
      )
    }
  ])
  return useTaobaoRegistry
}
