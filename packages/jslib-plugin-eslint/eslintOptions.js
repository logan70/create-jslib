exports.config = api => {
  const config = {
    root: true,
    env: { browser: true, node: true },
    parserOptions: {
      ecmaVersion: 9,
      sourceType: 'module'
    },
    extends: [],
    rules: {
      'no-console': makeJSOnlyValue(`process.env.NODE_ENV === 'production' ? 'error' : 'off'`),
      'no-debugger': makeJSOnlyValue(`process.env.NODE_ENV === 'production' ? 'error' : 'off'`)
    }
  }
  if (!api.hasPlugin('typescript')) {
    config.parserOptions.parser = 'babel-eslint'
  }
  if (api.hasPlugin('typescript')) {
    config.rules['import/no-unresolved'] = 'off'
  }
  return config
}

// __expression is a special flag that allows us to customize stringification
// output when extracting configs into standalone files
function makeJSOnlyValue (str) {
  const fn = () => {}
  fn.__expression = str
  return fn
}

const baseExtensions = ['.js', '.jsx']
exports.extensions = api => api.hasPlugin('typescript')
  ? baseExtensions.concat('.ts', '.tsx')
  : baseExtensions
