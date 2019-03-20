const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { clearConsoleWithVersion } = require('./clearConsoleWithVersion')

exports.checkTargetDir = async (targetDir, force, inCurrent) => {
  if (!fs.existsSync(targetDir)) {
    return
  }
  if (force) {
    await fs.remove(targetDir)
    return
  }
  await clearConsoleWithVersion()
  if (inCurrent) {
    const { ok } = await inquirer.prompt([
      {
        name: 'ok',
        type: 'confirm',
        message: `Generate project in current directory?`
      }
    ])
    if (!ok) {
      return
    }
  } else {
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
        choices: [
          { name: 'Overwrite', value: 'overwrite' },
          { name: 'Merge', value: 'merge' },
          { name: 'Cancel', value: false }
        ]
      }
    ])
    if (!action) {
      process.exit()
      return
    } else if (action === 'overwrite') {
      console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
      await fs.remove(targetDir)
    }
  }
}