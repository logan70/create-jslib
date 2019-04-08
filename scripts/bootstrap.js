// create package.json and README for packages that don't have one yet

const fs = require('fs')
const path = require('path')
const baseVersion = require('../packages/jslib-service/package.json').version

const packagesDir = path.resolve(__dirname, '../packages')
const files = fs.readdirSync(packagesDir)

files.forEach(pkg => {
  if (pkg.charAt(0) === '.') return

  const isPlugin = /^jslib-plugin-/.test(pkg)
  const desc = isPlugin
    ? `${pkg.replace('jslib-plugin-', '')} plugin for create-jslib`
    : `${pkg.replace('jslib-', '')} for create-jslib`

  const pkgPath = path.join(packagesDir, pkg, `package.json`)
  if (!fs.existsSync(pkgPath)) {
    const json = {
      'name': pkg,
      'version': baseVersion,
      'description': desc,
      'main': 'index.js',
      'repository': {
        'type': 'git',
        'url': 'git+https://github.com/logan70/create-jslib.git',
        'directory': `packages/${pkg}`
      },
      'keywords': [
        'jslib',
        'cli',
        isPlugin ? pkg.replace('jslib-plugin-', '') : pkg.replace('jslib-', '')
      ],
      'author': 'Logan Lee',
      'license': 'MIT',
      'bugs': {
        'url': 'https://github.com/logan70/create-jslib/issues'
      },
      'homepage': `https://github.com/logan70/create-jslib/tree/master/packages/${pkg}#readme`
    }
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2))
  }

  const readmePath = path.join(packagesDir, pkg, `README.md`)
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# ${pkg}\n\n> ${desc}`)
  }

  const npmIgnorePath = path.join(packagesDir, pkg, `.npmignore`)
  if (!fs.existsSync(npmIgnorePath)) {
    fs.writeFileSync(npmIgnorePath, `__tests__\n__mocks__\n.DS_Store\nnode_modules`)
  }
})
