# python-rencode

Arbitrary data encoder/decoder that matches python [`rencode`](https://github.com/aresch/rencode).

[![CircleCI](https://circleci.com/gh/cinderblock/python-rencode.svg?style=svg)](https://circleci.com/gh/cinderblock/python-rencode) [![Coverage Status](https://coveralls.io/repos/github/cinderblock/python-rencode/badge.svg?branch=master)](https://coveralls.io/github/cinderblock/python-rencode?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/cinderblock/python-rencode/badge.svg?targetFile=package.json)](https://snyk.io/test/github/cinderblock/python-rencode?targetFile=package.json)

## Usage

```bash
yarn add python-rencode
```

```js
const { encode, decode } = require('rencode');

const thing = 1;

const encoded = encode(thing);
const decoded = decode(encoded);

console.log(thing, 'encodes to:', encoded);
console.log(decoded, 'encodes to:', encoded);
```

## Development

### Setup

```bash
yarn
```

### Testing

```bash
yarn test
```

This will run the jest test suite.
It will also ensure code is formatted with prettier.

#### REPL

Start a repl with functions `encode` and `decode` loaded into the running context.

```bash
yarn repl
```

### Versioning and Publishing

```bash
# One of
yarn version patch
yarn version minor
yarn version major
```

This is automatically run prettier, run tests, ensure git worktree is clean, update version number, git commit and tag, build, publish, and push to origin in a single command.

### Build

```bash
yarn build
```
