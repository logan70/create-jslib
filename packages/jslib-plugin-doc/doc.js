const fs = require('fs')
const path = require('path')
const execa = require('execa')

async function jsDoc(args, api) {
  let destination
  const configPath = args.config || api.resolve('jsdoc.config.js')
  if (fs.existsSync(configPath)) {
    const config = require(configPath)
    destination = config.opts && config.opts.destination || ''
  }
  destination = destination || 'docs/'
  await execa('rimraf', [destination])
  const result = await execa('jsdoc', ['-c', configPath])
  return result
}

async function typeDoc(args, api) {
  const TypeDoc = require('typedoc')
  let config
  if (args.config && fs.existsSync(api.resolve(args.config)) && /\.json$/.test(args.config)) {
    await execa('typedoc', ['--tsconfig', args.config])
    return
  } else if (args.config && fs.existsSync(api.resolve(args.config)) && /\.js$/.test(args.config)) {
    config = require(api.resolve(args.config))
  } else {
    config = require('./lib/typeDocOptions').config(api)
  }

  const app = new TypeDoc.Application(config)
  const project = app.convert(app.expandInputFiles(config.include || ['src']))
  if (!project) {
    return
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
