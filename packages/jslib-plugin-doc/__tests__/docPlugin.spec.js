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

test('generate documentations with jsdoc', async () => {
  const project = await create(`doc-js`, {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {
        config: 'airbnb'
      },
      'jslib-plugin-doc': {}
    },
    useConfigFiles: true
  })
  const { has, run, read, dir } = project
  // should have comment in sorce code
  expect(await read('src/index.js')).toMatch('/**')

  // docdash
  await runSilently(() => {
    // since docdash (a theme of jsdoc) isn't actually installed in the test project, we need to
    // symlink it
    return linkBin(
      path.resolve(require.resolve('docdash/publish'), '../'),
      path.join(dir, 'node_modules', 'docdash')
    )
  })

  await run(`jslib-service build`)
  // should generate documentation
  expect(has('docs/index.html')).toBe(true)
})

test('generate documentations with typedoc', async () => {
  const project = await create(`doc-ts`, {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {
        config: 'airbnb'
      },
      'jslib-plugin-typescript': {
        useTsWithBabel: true
      },
      'jslib-plugin-doc': {}
    },
    useConfigFiles: true
  })
  const { has, run, read } = project
  // should have comment in sorce code
  expect(await read('src/index.ts')).toMatch('/**')

  await run(`jslib-service build`)
  // should generate documentation
  expect(has('docs/index.html')).toBe(true)
})
