const inquirer = require('inquirer')

module.exports = async (formats) => {
  const prompts = [{
    type: 'list',
    name: 'fomat',
    message: 'Select a format to develo:',
    choices: formats.map(format => ({ value: format, name: format }))
  }]

  const { format } = await inquirer.prompt(prompts)
  return format
}
