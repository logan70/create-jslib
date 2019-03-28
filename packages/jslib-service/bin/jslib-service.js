#!/usr/bin/env node

const path = require('path')
const { error, checkNodeVersion } = require('jslib-util')

const cwd = process.env.JSLIB_CONTEXT || process.cwd()
let letrequiredVersion
try {
  requiredVersion = require(path.resolve(cwd, './package.json')).engines.node
} catch (error) {
  requiredVersion = '>=8.9.0'
}

checkNodeVersion(requiredVersion, 'jslib-service')

const Service = require('../lib/Service.js')
const service = new Service(cwd)

const args = require('minimist')(process.argv.slice(2))
const command = args._[0]

service.run(command, args).catch(err => {
  error(err.message)
  console.log(err)
  process.exit(1)
})
