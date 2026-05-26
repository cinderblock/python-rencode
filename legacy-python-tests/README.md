# Legacy Python integration tests

These tests round-trip values through the actual Python `rencode` library to verify byte-for-byte parity. They were dropped from CI in the v2.0.0 modernization because the setup (pipenv + Python + `python-shell`) was brittle for marginal value over the unit tests in `src/rencode.test.ts`.

They're kept here for reference. To run them manually:

```sh
# Install Python rencode
python -m pip install rencode

# From the repo root, install the legacy node deps
npm install --no-save python-shell

# Then point a test runner at the .ts files in this directory.
# (You'll need ts-jest or similar — see the pre-v2 commit history.)
```

Files:
- `python.encode.ts` — JS encodes → Python decodes via the reference lib → compare.
- `python.decode.ts` — Python encodes via the reference lib → JS decodes → compare.
- `lib/encode.py`, `lib/decode.py` — Python sidecars invoked via `python-shell`.

If you re-enable these and want them in CI, add a separate workflow that sets up Python alongside Bun and runs them in a dedicated job.
