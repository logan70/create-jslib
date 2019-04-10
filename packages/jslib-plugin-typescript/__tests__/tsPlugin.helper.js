const create = require('jslib-test-utils/createTestProject')

exports.assertDev = async (name, options) => {
  let server
  test('dev', async () => {
    const project = await create(name, options)
    const { read, write, run } = project

    // lint-on-save needs to be tested in a callback
    let done
    const donePromise = new Promise(resolve => {
      done = resolve
    })

    server = run('jslib-service dev')

    let isFirstMsg = true
    server.stdout.on('data', async (data) => {
      data = data.toString()
      if (isFirstMsg) {
        isFirstMsg = false
        // should success
        expect(data).toMatch(/Compiled successfully/)
        const bundle = await read('dist/index.aio.js')
        expect(bundle).toMatch(`return 'Hello world!'`)
        expect(bundle).toMatch(`var foo = 'foo'`)
        const main = await read('src/index.ts')
        // modify 'Hello world!'
        const updatedMain = main.replace(/Hello world!/g, 'Hello Logan!')
        await write('src/index.ts', updatedMain)
      } else if (data.match(/Compiled successfully/)) {
        expect(await read('dist/index.aio.js')).toMatch('Hello Logan!')
        server.stdin.write('close')
        server = null
        done()
      }
    })

    await donePromise
  })

  afterAll(async () => {
    if (server) {
      server.stdin.write('close')
    }
  })
}

exports.assertBuild = async (name, options, customAssert) => {
  test('build', async () => {
    const project = await create(name, options)

    const { stdout } = await project.run('jslib-service build')
    expect(stdout).toMatch('Build complete.')
    const bundle = await project.read('dist/index.aio.js')
    expect(bundle).toMatch(`return 'Hello world!'`)
    expect(bundle).toMatch(`var foo = 'foo'`)
  })
}
