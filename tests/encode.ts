import { encode } from '..';

test('Encode 1 to be Buffer<1>', () => {
  expect(encode(1)).toEqual(Buffer.from([1]));
});
test("Encode 'a' to be Buffer<'a'>", () => {
  expect(encode('a')).toEqual(Buffer.from([129, 97]));
});

test('Encode undefined to be Error', () => {
  const t = undefined;

  const cast = (t as unknown) as null;

  expect(() => encode(cast)).toThrow('Cannot encode undefined');
});

test('Encode function to be Error', () => {
  const t = () => {};

  const cast = (t as unknown) as null;

  expect(() => encode(cast)).toThrow('Cannot encode function');
});

test('Encode Symbol to be Error', () => {
  const t = Symbol();

  const cast = (t as unknown) as null;

  expect(() => encode(cast)).toThrow('Cannot encode symbol');
});
