# jslib-plugin-unit-mocha

> unit-mocha plugin for create-jslib

## Injected Commands

- **`jslib-service test:unit`**

  Run unit tests with [mocha](https://mochajs.org/) + [chai](http://chaijs.com/).

  **Note the tests are run inside Node.js with browser environment simulated with JSDOM.**

  ```
  Usage: jslib-service test:unit [options] [...files]

  Options:

    --watch, -w: run in watch mode,
    --grep, -g: only run tests matching <pattern>,
    --slow, -s: "slow" test threshold in milliseconds,
    --timeout, -t: timeout threshold in milliseconds,
    --bail, -b: bail after first test failure,
    --require, -r: require the given module before running tests
  ```

  Default files matches are: any files in `tests/unit` that end in `.spec.(ts|js)`.

  All [mocha command line options](https://mochajs.org/#command-line-usage) are also supported.

## Installing in an Already Created Project

``` sh
create-jslib add unit-mocha
```
