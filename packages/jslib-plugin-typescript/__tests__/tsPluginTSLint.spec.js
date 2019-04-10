jest.setTimeout(30000)

const create = require('jslib-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-tslint', {
    plugins: {
      'jslib-plugin-typescript': {
        tsLint: true
      }
    }
  })
  const { read, write, run } = project
  const main = await read('src/index.ts')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.ts', updatedMain)
  // lint
  await run('jslib-service lint')
  expect(await read('src/index.ts')).toMatch(';')
})

test('should not fix with --no-fix option', async () => {
  const project = await create('ts-tslint-nofix', {
    plugins: {
      'jslib-plugin-typescript': {
        tsLint: true
      }
    }
  })
  const { read, write, run } = project
  const main = await read('src/index.ts')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.ts', updatedMain)

  // lint with no fix should fail
  try {
    await run('jslib-service lint --no-fix')
  } catch (e) {
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }

  // files should not have been fixed
  expect(await read('src/index.ts')).not.toMatch(';')
})

test('should ignore issues in node_modules', async () => {
  const project = await create('ts-lint-node_modules', {
    plugins: {
      'jslib-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/index.ts')

  // update file to not match tslint spec and dump it into the node_modules directory
  const updatedMain = main.replace(/;/g, '')
  await write('node_modules/bad.ts', updatedMain)

  // lint
  await run('jslib-service lint')
  expect(await read('node_modules/bad.ts')).toMatch(updatedMain)
})
