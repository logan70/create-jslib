## Development Setup

This project uses a monorepo setup that requires using [Yarn](https://yarnpkg.com) because it relies on [Yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

``` sh
# install dependencies
npm install

# link `jslib` executable
cd packages/jslib/cli
npm link

# create test projects in /packages/test
cd ../../test
jslib create test-lib
cd test-lib
npm run dev
```

### Testing Tips

To run a full test:

``` sh
npm run test
```

You can pass the test script a regex to match test filenames:

``` sh
yarn test <filenameRegex>
```

Note the regex matches against full paths relative to the project root, so for example if you want to test all the prompt modules in `packages/jslib/cli/lib/promptModules`, you can simply run:

``` sh
yarn test promptModules
```

Alternatively, you can run the tests inside specific packages with the `-p` flag:

``` sh
yarn test -p cli,service
```

If the package is a plugin, you can omit the `plugin-` prefix:

``` sh
yarn test -p typescript
```

You can also pass `--watch` to run tests in watch mode.

Note that `jest --onlyChanged` isn't always accurate because some tests spawn child processes.

### Plugin Development
