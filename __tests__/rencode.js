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
  // MAX_SIGNED_LONGLONG,
  // 12312341234,

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
  'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf',
].forEach(v =>
  test('Encode and Decode: ' + v, () => {
    expect(decode(encode(v))).toEqual(v);
  })
);
