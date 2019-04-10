jest.setTimeout(35000)

const path = require('path')
const { linkBin } = require('create-jslib/lib/util/linkBin')
const create = require('jslib-test-utils/createTestProject')

const runSilently = fn => {
  const log = console.log
  console.log = () => {}
  const res = fn()
  console.log = log
  return res
}

test('should work', async () => {
  const project = await create('eslint', {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  }, null, true /* initGit */)
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/index.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.js', updatedMain)
  // lint
  await run('jslib-service lint')
  expect(await read('src/index.js')).toMatch(';')

  // lint-on-commit
  await runSilently(() => {
    const { install } = require('husky/lib/installer/index')
    install(path.join(project.dir, 'node_modules/husky'))
    // since yorkie isn't actually installed in the test project, we need to
    // symlink it
    return linkBin(
      path.resolve(require.resolve('husky/lib/installer/index'), '../../../'),
      path.join(project.dir, 'node_modules', 'husky')
    )
  })
  const hook = await read('.git/hooks/pre-commit')
  expect(hook).toMatch('# husky')
  await write('src/index.js', updatedMain)
  // nvm doesn't like PREFIX env
  if (process.platform === 'darwin') {
    delete process.env.PREFIX
  }
  await run('git add -A')
  await run('git commit -m save')
  // should be linted on commit
  expect(await read('src/index.js')).toMatch(';')

  // lint-on-save needs to be tested in a callback
  let done
  const donePromise = new Promise(resolve => {
    done = resolve
  })
  // enable lintOnSave
  await write('jslib.config.js', 'module.exports = { lintOnSave: true };\n')
  // write invalid file
  await write('src/index.js', updatedMain)

  const server = run('jslib-service dev')

  let isFirstMsg = true
  server.stdout.on('data', data => {
    data = data.toString()
    if (isFirstMsg) {
      // should fail on start
      expect(data).toMatch(/Missing semicolon/)
      isFirstMsg = false
    }
    if (data.match(/Compiled with warnings, waiting for changes/)) {
      // fix it
      write('src/index.js', main)
    }

    if (data.match(/Compiled successfully/)) {
      // should compile on the subsequent update
      // (note: in CI environment this may not be the exact 2nd update,
      // so we use data.match as a termination condition rather than a test case)
      server.stdin.write('close')
      done()
    }
  })

  await donePromise
})

test('should not fix with --no-fix option', async () => {
  const project = await create('eslint-nofix', {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  })
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/index.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.js', updatedMain)

  // lint with no fix should fail
  try {
    await run('jslib-service lint --no-fix')
  } catch (e) {
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }

  // files should not have been fixed
  expect(await read('src/index.js')).not.toMatch(';')
})

// #3167, #3243
test('should not throw when src folder is ignored by .eslintignore', async () => {
  const project = await create('eslint-ignore', {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    },
    useConfigFiles: true
  })

  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/index.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.js', updatedMain)
  await write('.eslintignore', 'src\n.eslintrc.js')

  // should not throw
  await run('jslib-service lint --no-fix')
})
