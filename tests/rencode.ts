import { decode, encode } from '..';

test('type encoded positive integer', () => {
  const v = 1;
  expect(decode(encode(v))).toEqual(v);
});

test('type encoded negative integer', () => {
  const v = -5;
  expect(decode(encode(v))).toEqual(v);
});

test('byte positive integer', () => {
  const v = 46;
  expect(decode(encode(v))).toEqual(v);
});

test('byte negative integer', () => {
  const v = -47;
  expect(decode(encode(v))).toEqual(v);
});

test('short positive integer', () => {
  const v = 128;
  expect(decode(encode(v))).toEqual(v);
});

test('short negative integer', () => {
  const v = -129;
  expect(decode(encode(v))).toEqual(v);
});

test('long positive integer', () => {
  const v = 32768;
  expect(decode(encode(v))).toEqual(v);
});

test('long negative integer', () => {
  const v = -32769;
  expect(decode(encode(v))).toEqual(v);
});

test('bigger positive integer', () => {
  const v = 2 ** (8 * 4 - 1);
  expect(decode(encode(v))).toEqual(v);
});

test('bigger negative integer', () => {
  const v = -(2 ** (8 * 4 - 1)) - 1;
  expect(decode(encode(v))).toEqual(v);
});

test('Huge positive integer', () => {
  const v = 9007199254740991;
  expect(decode(encode(v))).toEqual(v);
});

test('Huge negative integer', () => {
  const v = -9007199254740991;
  expect(decode(encode(v))).toEqual(v);
});

test('float', () => {
  const v = 1.123;
  expect(decode(encode(v))).toEqual(v);
});

test('bool true', () => {
  const v = true;
  expect(decode(encode(v))).toEqual(v);
});

test('bool false', () => {
  const v = false;
  expect(decode(encode(v))).toEqual(v);
});

test('null (None)', () => {
  const v = null;
  expect(decode(encode(v))).toEqual(v);
});

test('short string', () => {
  const v = 'aasdf';
  expect(decode(encode(v))).toEqual(v);
});

test('long string', () => {
  const v =
    '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
  expect(decode(encode(v))).toEqual(v);
});

test('short array', () => {
  const v = [1, 'a', true];
  expect(decode(encode(v))).toEqual(v);
});

test('long array', () => {
  const v = '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7'.split(
    ''
  );
  expect(decode(encode(v))).toEqual(v);
});

test('small object', () => {
  const v = { a: 1, b: 'a', c: true };
  expect(decode(encode(v))).toEqual(v);
});

test('big object', () => {
  const v = { 1: 0 };
  expect(decode(encode(v))).toEqual(v);
});

test('emoji', () => {
  const v = '🤷';
  expect(decode(encode(v))).toEqual(v);
});

const s = 'string'.repeat(20);
const a = s.split('');
const o = <any>{};
a.forEach((v, i) => (o[i] = v));

test('Encode and Decode Long String', () => {
  expect(decode(encode(s))).toEqual(s);
});
test('Encode and Decode Long Array', () => {
  expect(decode(encode(a))).toEqual(a);
});
test('Encode and Decode Large Object', () => {
  expect(decode(encode(o))).toEqual(o);
});

test('Encode and Decode Float32', () => {
  const f = 1.2000000476837158;
  expect(decode(encode(f, 32))).toEqual(f);
});

test('Decode long ascii string', () => {
  const str =
    '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
  expect(decode(encode(str), false)).toEqual(str);
});
