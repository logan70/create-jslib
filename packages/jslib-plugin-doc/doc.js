const fs = require('fs')
const { error, execa } = require('jslib-util')

async function jsDoc (args, api) {
  const configPath = args.config || api.resolve('jsdoc.config.js')
  if (!fs.existsSync(configPath)) {
    error('Cannot find jsdoc option file `jsdoc.config.js`')
  }
  const config = require(configPath)
  const destination = config.opts && config.opts.destination || 'docs/'
  await execa('rimraf', [destination])
  const result = await execa('jsdoc', ['-c', configPath])
  return result
}

async function typeDocExec (args, api) {
  const configPath = api.resolve(args.config || 'typedoc.json')
  if (!fs.existsSync(configPath)) {
    error(`Cannot find typeDoc option file '${args.config || 'typedoc.json'}'`)
  }
  const config = require(configPath)
  const destination = config.out || 'docs/'
  await execa('rimraf', [destination])
  const result = await execa('typedoc', ['--options', configPath])
  return result
}

async function typeDoc (args, api) {
  const TypeDoc = require('typedoc')
  let config
  if (args.config && fs.existsSync(api.resolve(args.config)) && /\.json$/.test(args.config)) {
    const result = await execa('typedoc', ['--tsconfig', args.config])
    return result
  } else if (args.config && fs.existsSync(api.resolve(args.config)) && /\.js$/.test(args.config)) {
    config = require(api.resolve(args.config))
  } else {
    config = require('./lib/typeDocOptions').config(api)
  }

  const app = new TypeDoc.Application(config)
  const project = app.convert(app.expandInputFiles(config.include || ['src']))
  if (!project) {
    const result = await typeDocExec(args, api)
    return result
  }
  await execa('rimraf', [config.outputDir || 'docs/'])
  const result = await app.generateDocs(project, config.outputDir || 'docs/')
  return result
}

module.exports = async (args, api) => {
  let result
  if (api.hasPlugin('typescript')) {
    result = await typeDoc(args, api)
  } else {
    result = await jsDoc(args, api)
  }
  return result
}
