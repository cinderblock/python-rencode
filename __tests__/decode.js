const { decode } = require('../rencode.js');

test('Decode Buffer<1> to be 1', () => {
  expect(decode(Buffer.from([1]))).toEqual(1);
});

test("Decode 'a' to be Buffer<'a'>", () => {
  expect(decode(Buffer.from([129, 97]))).toEqual('a');
});

test('Decode big number to be Error', () => {
  expect(() => decode(Buffer.from([65, 1, 0, 0, 0, 0, 0, 0, 0]))).toThrow('Encoded value outside of decodable range.');
});

test('Decode bad argument', () => {
  const o = {};
  o.length = -1;
  expect(() => decode(o)).toThrow('Malformed rencoded string: data_length: ' + -1 + ' pos: ' + 0);
});
