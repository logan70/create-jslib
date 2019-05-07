<%_ if (!useTS) { _%>
const path = require('path')
module.exports = {
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc','closure']
  },
  source: {
    include: ['./src', 'README.md'],
    includePattern: '.+\\.js(doc)?$',
    excludePattern: '(^|\\/|\\\\)_'
  },
  plugins: [],
  templates: {
    cleverLinks: false,
    monospaceLinks: false
  },
  opts: {
    template: path.relative(process.cwd(), path.resolve(require.resolve('docdash/publish'), '../')),
    encoding: 'utf8',
    destination: 'docs/',
    recurse: true
  },
  docdash: {
    static: true,
    sort: true,
    search: true,
    collapse: true,
    wrap: true,
    typedefs: true,
    navLevel: 1
  }
}
<%_ } _%>