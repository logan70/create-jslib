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

![](https://user-gold-cdn.xitu.io/2019/4/8/169fbfbdd9872545?w=599&h=300&f=png&s=17916)

The default setup is great for quickly prototyping a new libraries, while the manual setup provides more options that are likely needed for more production-oriented libraries.

![](https://user-gold-cdn.xitu.io/2019/4/8/169fbfdabf732d02?w=850&h=300&f=png&s=28959)

The `create-jslib` command has a number of options and you can explore them all by running:

```bash
create-jslib --help
```

```bash
Usage: create-jslib <command> [options]

Run create-jslib <lib-name> to create a new project powered by jslib-service

Options:
  -V, --version                   output the version number
  -d, --default                   Skip prompts and use default preset
  -m, --packageManager <command>  Use specified npm client when installing dependencies
  -r, --registry <url>            Use specified npm registry when installing dependencies (only for npm)
  -g, --git [message]             Force git initialization with initial commit message
  -n, --no-git                    Skip git initialization
  -f, --force                     Overwrite target directory if it exists
  -x, --proxy                     Use specified proxy when creating project
  -h, --help                      output usage information

Commands:
  create [options] <lib-name>     create a new project powered by jslib-service
  info                            print debugging information about your environment

  Run create-jslib <command> --help for detailed usage of given command.
```

## JSLib Service

**Using the Binary**

Inside a Create JSLib project, jslib-service installs a binary named jslib-service. 

This is what you will see in the package.json of a project using the default preset:

```json
{
  "scripts": {
    "dev": "jslib-service dev",
    "build": "jslib-service build",
    "lint": "jslib-service lint"
  }
}
```

You can invoke these scripts using either npm or Yarn:

```bash
npm run dev
# OR
yarn dev
```

**jslib-service dev**

The `jslib-service dev`  command creates a js bundle (based on [rollup](https://rollupjs.org/guide/en)) and watches for changes.

```bash
Usage: jslib-service dev [options] [entry]

Options:

  --entry   specify entry point (default: src/index.js)
  --dest    specify output directory (default: dist)
  --formats list of output formats for library builds (default: umd)
  --name    name for umd bundle (default: "name" in package.json or entry filename)
```

**jslib-service build**

The `jslib-service build`  command produces a production-ready bundle (default to be `UMD` format) in the `dist/` directory.

```bash
Usage: jslib-service build [options]

Options:

  --entry    specify entry point (default: src/index.js)
  --dest     specify output directory (default: dist)
  --formats  list of output formats for library builds (default: umd)
  --name     name for umd bundle (default: "name" in package.json or entry filename)
  --no-clean do not remove the dist directory before building the project
```

**jslib-service lint**

The `jslib-service lint`  command lints source code and shows the lint results.

```bash
Usage: jslib-service lint [options] [...files]

Options:

  --format [formatter]   specify formatter (default: codeframe)
  --fix                  fix errors or warnings
  --fix-errors           fix errors, but do not fix warnings
  --max-errors [limit]   specify number of errors to make build failed (default: 0)
  --max-warnings [limit] specify number of warnings to make build failed (default: Infinity)

For more options, see https://eslint.org/docs/user-guide/command-line-interface#options
```

## CHANGELOG

Please see [CHANGELOG](https://github.com/logan70/create-jslib/blob/master/CHANGELOG.md)

## Contributing

Please see [contributing guide](https://github.com/logan70/create-jslib/blob/master/.github/CONTRIBUTING.md).

## License

[MIT](https://github.com/logan70/create-jslib/blob/master/LICENSE)
