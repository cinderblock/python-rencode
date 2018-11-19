# Tests

## Decoding specific tests - `decode.ts`

## Encoding specific tests - `encode.ts`

## Encode with Python, decode with node - `python.encode.ts`

This runs python in a sub shell.
It encodes arbitrary data into JSON on the JavaScript side and sends that to the python script `tests/lib/encode.py`.
The python decodes the JSON, encodes the data with python's rencode, turns the output into hex bytes, and prints that to stdout.
The node then reads this hex string from the python, creates a `Buffer`, decodes is, and compares to the original.

## Decoding + Encoding + decoding tests - `rencode.ts`
