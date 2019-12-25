# python-rencode

Arbitrary data encoder/decoder that matches python [`rencode`](https://github.com/aresch/rencode).

[![Coverage Status](https://coveralls.io/repos/github/cinderblock/python-rencode/badge.svg?branch=master)](https://coveralls.io/github/cinderblock/python-rencode?branch=master)

## Usage

```bash
yarn add python-rencode
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

<!-- NOPUBLISH -->

## Development

### Setup

```bash
yarn setup
```

### Testing

```bash
yarn test
```

This will run the jest test suite.

### Formatting

Ensure code is formatted with our style.

```bash
yarn format
```

This is generally unnecessary with "Format On Save" features of most editors.
VS Code should work immediately.

#### REPL

Start a repl with functions `encode` and `decode` loaded into the running context.

```bash
yarn repl
```

### Versioning and Publishing

Just run any single npm/yarn version command.

```bash
# Any of these work. Other variations work too.
yarn version
yarn version --minor
npm version major
```

This will automatically run prettier and tests, ensure git worktree is clean, update version number, git commit and tag, build, publish, and git push to origin in a single command.

### Build

```bash
yarn build
```
