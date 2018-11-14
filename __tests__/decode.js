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

test('Decode huge number to be Error', () => {
  const b = Buffer.alloc(70);
  b[0] = 61;
  b[b.length - 1] = 127;

  expect(() => decode(b)).toThrow('Number is longer than ' + 64 + ' characters');
});

test('Decode invalid codes in buffer results in error', () => {
  expect(() => decode(Buffer.from([45]))).toThrow('Unexpected typecode received (' + 45 + ') at position ' + 0);
});

test('Decode short buffer result in error', () => {
  expect(() => decode(Buffer.from([62]))).toThrow('Tried to access data[' + 1 + '] but data len is: ' + 1);
});
