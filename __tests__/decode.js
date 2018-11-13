const { decode } = require('../rencode.js');

test('Decode Buffer<1> to be 1', () => {
  expect(decode(Buffer.from([1]))).toEqual(1);
});
test("Decode 'a' to be Buffer<'a'>", () => {
  expect(decode(Buffer.from([129, 97]))).toEqual('a');
});
