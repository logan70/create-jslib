const inquirer = require('inquirer')

module.exports = async (formats) => {
  // transform umd-min format to umd and deduplicate in development
  const devFormats = Array.from(new Set(
    ...formats.map(format => format.replace(/[\-\.]min/, ''))
  ))

  const prompts = [{
    type: 'list',
    name: 'fomat',
    message: 'Select a format to develo:',
    choices: devFormats.map(format => ({ value: format, name: format}))
  }]

  const { format } = await inquirer.prompt(prompts)
  return format
}