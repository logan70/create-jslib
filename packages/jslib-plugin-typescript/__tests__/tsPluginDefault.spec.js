jest.setTimeout(30000)

const { assertDev, assertBuild } = require('./tsPlugin.helper')

const options = {
  plugins: {
    'jslib-plugin-typescript': {
      tsLint: true
    }
  }
}

assertDev('ts-default-dev', options)
assertBuild('ts-default-build', options)
