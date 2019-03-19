const { error } = require('jslib-util')
const { createSchema, validate } = require('jslib-util')

const presetSchema = createSchema(joi => joi.object().keys({
  useConfigFiles: joi.boolean(),
  plugins: joi.object().required(),
  configs: joi.object(),
  packageManager: joi.string()
}))

exports.validatePreset = preset => validate(preset, presetSchema, msg => {
  error(`invalid preset options: ${msg}`)
})

exports.defaultPreset = {
  useConfigFiles: false,
  plugins: {
    'jslib-plugin-babel': {},
    'jslib-plugin-eslint': {
      config: 'base',
      lintOn: ['save']
    }
  }
}
