# python-rencode

A TypeScript encoder/decoder for the `rencode` wire format used by [Deluge](https://deluge-torrent.org/)'s RPC API. Output matches the reference Python [`rencode`](https://github.com/aresch/rencode) library.

[![CI](https://github.com/cinderblock/python-rencode/actions/workflows/ci.yml/badge.svg)](https://github.com/cinderblock/python-rencode/actions)

## Install

```sh
bun add python-rencode
# or: npm install python-rencode
```

## Usage

```ts
import { encode, decode } from 'python-rencode';

const encoded = encode({ hello: 'world', n: 42 });
//                 ↳ Buffer<...>

const back = decode(encoded);
//                 ↳ { hello: 'world', n: 42 }
```

Both `encode` and `decode` are also exported as `dumps` and `loads` (matching the Python API naming).

### Float precision

Floats encode to 64 bits by default. Pass `32` to encode as IEEE-754 single-precision:

```ts
encode(1.5, 32);
```

### Decoding to bytes instead of UTF-8

`decode` decodes string typecodes as UTF-8 by default. Pass `false` to keep raw ASCII:

```ts
decode(buf, false);
```

## What's supported

Numbers (int8 / int16 / int32 / int48 / float32 / float64, picked automatically based on the value), booleans, `null`, strings (UTF-8), arrays, and plain objects. `undefined`, functions, and `Symbol`s throw — there's no rencode typecode for them.

Numbers larger than ~2^47 round-trip through the variable-length integer typecode but are read as JavaScript numbers, so precision is bound by `Number.MAX_SAFE_INTEGER` (2^53 - 1). `BigInt` is not supported.

## Migrating from 1.x

The public API (`encode` / `decode` / `dumps` / `loads`) is unchanged. v2 is a toolchain refresh:

- **ESM only.** The published `dist/rencode.js` is ESM with a `.d.ts`. CJS consumers on Node 22+ can still `require()` it via require(ESM).
- **Bun for development.** `bun install`, `bun test`, `bun run build` (which still calls `tsc` for the published output).
- **`engines.node` bumped to 22+** (also `engines.bun >= 1.2`).
- The hand-maintained `dist-extras.ts` machinery and `private: true` + publish-from-`dist/` hack are gone. Standard `files` field in `package.json` controls what ships.

## Development

```sh
bun install
bun test src        # unit tests
bun run lint        # tsc --noEmit
bun run build       # emits dist/
bun run format      # prettier
```

CI runs all of those on push.

### Python parity tests

The original repo also had Python integration tests that round-tripped values through the actual `python-rencode` library (via `python-shell` + `pipenv`). They've been moved to `legacy-python-tests/` and are no longer wired into CI — they were brittle and required pipenv + Python in CI for marginal value over the unit tests. If you want to verify Python parity, see the legacy directory for the setup pattern.

## Publishing

Tag `v*` and push. CI publishes to npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers) with provenance — no NPM_TOKEN needed.

## Change log

### v2.0.0

Toolchain refresh; API unchanged. See "Migrating from 1.x" above.

### v1.4.0

API change: `undefined` is no longer accepted as a value (throws). `null` should be used instead.

### v1.3.0

Exported `RencodableData` type.

### v1.2.0

TypeScript declarations.

### v1.1.0

Decode UTF-8 by default.

## License

ISC.
