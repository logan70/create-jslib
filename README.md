# Create JSLib

> CLI tool for rapidly build JavaScript Libraries.

## Usage

To install the latest version of `Create JSLib`, use one of those commands:

```bash
npm install -g create-jslib
# OR
yarn global add create-jslib
```

To create a new project, run:

```bash
create-jslib lib-name
# OR
create-jslib create lib-name
```

> If you are on Windows using Git Bash with minTTY, the interactive prompts will not work. You must launch the command as winpty create-jslib.cmd create hello-world. If you however want to still use the create-jslib lib-name syntax, you can alias the command by adding the following line to your ~/.bashrc file. alias create-jslib='winpty create-jslib.cmd' You will need to restart your Git Bash terminal session to pull in the updated bashrc file.

You will be prompted to pick a preset. You can either choose the default preset which comes with a basic Babel + ESLint setup, or select "Manually select features" to pick the features you need.

## CHANGELOG

Please see [CHANGELOG](https://github.com/logan70/create-jslib/blob/master/CHANGELOG.md)

## Contributing

Please see [contributing guide](https://github.com/logan70/create-jslib/blob/master/.github/CONTRIBUTING.md).

## License

[MIT](https://github.com/logan70/create-jslib/blob/master/LICENSE)
