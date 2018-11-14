const { encode } = require('../rencode.js');

test('Encode 1 to be Buffer<1>', () => {
  expect(encode(1)).toEqual(Buffer.from([1]));
});
test("Encode 'a' to be Buffer<'a'>", () => {
  expect(encode('a')).toEqual(Buffer.from([129, 97]));
});

test('Encode function to be Error', () => {
  expect(() => encode(() => {})).toThrow('Cannot handle function');
});
