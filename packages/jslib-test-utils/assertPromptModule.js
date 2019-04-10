// using this requires mocking fs & inquirer

// eslint-disable-next-line
const Creator = require('create-jslib/lib/Creator')
// eslint-disable-next-line
const { expectPrompts } = require('inquirer') // from <root>/__mock__

module.exports = async function assertPromptModule (
  module,
  expectedPrompts,
  expectedOptions,
  opts = {}
) {
  // auto fill non-module prompts
  if (opts.pluginsOnly) {
    expectedPrompts.unshift(
      {
        message: 'Please pick a preset',
        choose: 1
      }
    )
    expectedPrompts.push(
      {
        message: 'Where do you prefer placing config',
        choose: 1 // package.json
      }
    )
    expectedPrompts.push({
      message: 'package manager',
      choose: 0 // yarn
    })
  }

  expectPrompts(expectedPrompts)
  const creator = new Creator('test', '/', [].concat(module))
  const preset = await creator.promptAndResolvePreset()

  if (opts.pluginsOnly) {
    delete preset.useConfigFiles
  }
  expect(preset).toEqual(expectedOptions)
}
