# python-rencode

Arbitrary data encoder/decoder that matches python [`rencode`](https://github.com/aresch/rencode).

[![](https://github.com/cinderblock/python-rencode/workflows/Build%2C%20Test%2C%20and%20Publish/badge.svg)](https://github.com/cinderblock/python-rencode/actions)
[![Coverage Status](https://coveralls.io/repos/github/cinderblock/python-rencode/badge.svg?branch=master)](https://coveralls.io/github/cinderblock/python-rencode?branch=master)

## Usage

```bash
npm install python-rencode
```

```js
const { encode, decode } = require('python-rencode');

// Could be basically any data that would convert correctly to JSON
const thing = 1;

// Encode some data into a Buffer
const encoded = encode(thing);

// Decode a Buffer into some data
const decoded = decode(encoded);
```

## Install as Git Dependency

If you'd rather not use the versions published to npm, you can easily install from github directly with:

```bash
npm install cinderblock/python-rencode         # Defaults to master
npm install cinderblock/python-rencode#branch  # Use a named branch
npm install cinderblock/python-rencode#v1.4.0  # Use a tagged version
npm install cinderblock/python-rencode#hash    # Use a hash directly
```

## Change Log

### v1.4.0

**`v1.4.0` slightly changed the API.**

- `undefined` has been replaced with `null`.
- `undefined` is no longer allowed as a value and will now throw.
  _This behavior might change in the future. Make an issue to discuss._

### v1.3.0

- Export data type: `RencodableData`

### v1.2.0

- Add TypeScript Support

### v1.1.0

- Decode UTF8 by default

<!-- NOPUBLISH -->

## Development

### Setup

```bash
yarn setup
```

### Testing

Run the jest test suite against TypeScript sources.

```bash
yarn test
yarn test --coverage             # Generate coverage reports
yarn test --watchAll             # Watch mode
yarn test --watchAll --coverage  # Combined
```

The test suite can also be run against any arbitrary copy of the library by setting the environment variable `JEST_IMPORT_OVERRIDE`.
This is useful for testing against the compiled JavaScript `dist` folder or a git dependency.
Both of these use cases are tested automatically in Github Actions.

### Formatting

Ensure code is formatted with our style.

```bash
yarn format --check
yarn format --write
```

This is generally unnecessary with "Format On Save" features of most editors.
VS Code should work automatically because of workspace settings.

#### REPL

Start a repl with functions `encode` and `decode` loaded into the running context.

```bash
yarn repl
```

### Versioning

Just run any single npm/yarn version command.

```bash
# Any of these work. Other variations work too.
yarn version
yarn version --minor
npm version major
```

### Publishing

Version bumps trigger a publish to npm on Github Actions.

We build a `dist` folder to publish from.
The published version has a simplified `README.md` and `package.json`.

### Build

We build a `dist` folder to actually publish from.

```bash
yarn build
```

This builds the TypeScript, copies this README with development sections removed, and copies a simplified version of the package.json for Npm.
