exports.getPromptModules = () => {
  return [
    'babel',
    'typescript',
    'linter',
    'doc',
    'unit'
  ].map(file => require(`../promptModules/${file}`))
}
