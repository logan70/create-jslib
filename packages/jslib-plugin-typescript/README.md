# jslib-plugin-typescript

> typescript plugin for create-jslib

Uses TypeScript + `rollup-plugin-typescript2` + for faster type checking.

## Configuration

TypeScript can be configured via `tsconfig.json`.

This plugin can be used alongside `jslib-plugin-babel`. When used with Babel, this plugin will output ES2015 and delegate the rest to Babel for auto polyfill based on browser targets.

## Injected Commands

If opted to use [TSLint](https://palantir.github.io/tslint/) during project creation, `jslib-service lint` will be injected.
