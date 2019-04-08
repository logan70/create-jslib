exports.getPromptModules = () => {
  return [
    'babel',
    'outputFormats',
    'typescript',
    'linter',
    'doc',
    'unit'
  ].map(file => require(`../promptModules/${file}`))
}
