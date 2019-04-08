// Infer rootOptions for individual generators being invoked
// in an existing project.

module.exports = function inferRootOptions (pkg) {
  const rootOptions = {}
  // const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies)

  // projectName
  rootOptions.projectName = pkg.name

  return rootOptions
}
