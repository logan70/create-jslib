const fs = require('fs')
const path = require('path')
const execa = require('execa')
const cc = require('conventional-changelog')

function genNewRelease (version) {
  return new Promise(resolve => {
    const newReleaseStream = cc({
      releaseCount: 1,
      pkg: {
        transform (pkg) {
          pkg.version = `v${version}`
          return pkg
        }
      }
    })

    let output = ''
    newReleaseStream.on('data', buf => {
      output += buf
    })
    newReleaseStream.on('end', () => resolve(output))
  })
}

const gen = (module.exports = async version => {
  const newRelease = await genNewRelease(version)
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md')

  const newChangelog = newRelease + fs.readFileSync(changelogPath, { encoding: 'utf8' })
  console.log(newChangelog)
  fs.writeFileSync(changelogPath, newChangelog)

  delete process.env.PREFIX
  await execa('git', ['add', '-A'], { stdio: 'inherit' })
  await execa('git', ['commit', '-m', `chore: ${version} changelog`], { stdio: 'inherit' }) //  [ci skip]
})

if (process.argv[2] === 'run') {
  const version = require('../lerna.json').version
  gen(version)
}
