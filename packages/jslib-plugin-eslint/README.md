# jslib-plugin-eslint

> eslint plugin for create-jslib

## Injected Commands

- **`jslib-service lint`**

  ```
  Usage: jslib-service lint [options] [...files]

  Options:

    --format [formatter] specify formatter (default: codeframe)
    --no-fix             do not fix errors
    --max-errors         specify number of errors to make build failed (default: 0)
    --max-warnings       specify number of warnings to make build failed (default: Infinity)
  ```

  Lints and fixes files. If no specific files are given, it lints all files in `src` and `test`.

  Other [ESLint CLI options](https://eslint.org/docs/user-guide/command-line-interface#options) are also supported.

## Configuration

ESLint can be configured via `.eslintrc.js`.

Lint-on-save during development with `rollup-plugin-eslint` is enabled by default. It can be disabled with the `lintOnSave` option in `jslib.config.js`:

``` js
module.exports = {
  lintOnSave: false
}
```

When set to `true`, `rollup-plugin-eslint` will emit lint errors as warnings. By default, warnings are only logged to the terminal and does not fail the compilation.

When `lintOnSave` is a truthy value, `eslint` will be applied in both development and production. If you want to disable `eslint` during production build, you can use the following config:

``` js
// jslib.config.js
module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production'
}
```
