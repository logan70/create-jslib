# jslib-plugin-babel

> babel plugin for create-jslib

## Configuration

Uses Babel 7 and `rollup-plugin-babel` by default, but can be configured via `babel.config.js` to use any other Babel presets or plugins.

By default, `rollup-plugin-babel` excludes files inside `node_modules` dependencies. If you wish to explicitly transpile a dependency module, you will need to add it to the `transpileDependencies` option in `jslib.config.js`:

``` js
module.exports = {
  transpileDependencies: [
    // can be string or regex
    'my-dep',
    /other-dep/
  ]
}
```