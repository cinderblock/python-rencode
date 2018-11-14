const { encode, decode } = require('../rencode.js');

[
  // Test byte integers
  1,
  -5,
  // Test short integers
  128,
  -129,
  // Test long integers
  32768,
  -32769,
  // Test bigger integers
  2 ** (8 * 4 - 1),
  -(2 ** (8 * 4 - 1)) - 1,
  // Test Huge integers
  Number.MAX_SAFE_INTEGER,
  Number.MIN_SAFE_INTEGER,
  // Test float
  1.123,
  // Test bool true
  true,
  // Test bool false
  false,
  // Test undefined (None)
  undefined,
  // Test short string
  'aasdf',
  // Test long string
  'a'.repeat(80),
  // Test array
  [1, 'a', true],
  // Test long array
  'a'.repeat(80).split(''),
  // Test object
  { a: 1, b: 'a', c: true },
].forEach(v =>
  test('Encode and Decode: ' + v, () => {
    expect(decode(encode(v))).toEqual(v);
  })
);

test('Encode and Decode Float32', () => {
  expect(decode(encode(1.2000000476837158, 32))).toEqual(1.2000000476837158);
});
