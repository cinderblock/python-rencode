import { describe, it, expect } from 'bun:test';
import { encode, decode } from './rencode.js';

describe('encode', () => {
  it('encodes 1 to Buffer<1>', () => {
    expect(encode(1)).toEqual(Buffer.from([1]));
  });
  it("encodes 'a' to Buffer<129, 97>", () => {
    expect(encode('a')).toEqual(Buffer.from([129, 97]));
  });
  it('throws on undefined', () => {
    expect(() => encode(undefined as unknown as null)).toThrow('Cannot encode undefined');
  });
  it('throws on function', () => {
    expect(() => encode((() => {}) as unknown as null)).toThrow('Cannot encode function');
  });
  it('throws on Symbol', () => {
    expect(() => encode(Symbol() as unknown as null)).toThrow('Cannot encode symbol');
  });
});

describe('decode', () => {
  it('decodes Buffer<1> to 1', () => {
    expect(decode(Buffer.from([1]))).toEqual(1);
  });
  it("decodes Buffer<129, 97> to 'a'", () => {
    expect(decode(Buffer.from([129, 97]))).toEqual('a');
  });
  it('throws on big number out of range', () => {
    expect(() => decode(Buffer.from([65, 1, 0, 0, 0, 0, 0, 0, 0]))).toThrow(
      'Encoded value outside of decodable range.',
    );
  });
  it('throws on bad buffer', () => {
    expect(() => decode(Buffer.from([103, 69]))).toThrow(
      'Malformed rencoded string: data.length: 2 pos: 2',
    );
  });
  it('throws on huge number', () => {
    const b = Buffer.alloc(70);
    b[0] = 61;
    b[b.length - 1] = 127;
    expect(() => decode(b)).toThrow('Number is longer than 64 characters');
  });
  it('throws on invalid typecode', () => {
    expect(() => decode(Buffer.from([45]))).toThrow(
      'Unexpected typecode received (45) at position 0',
    );
  });
  it('throws on short buffer', () => {
    expect(() => decode(Buffer.from([62]))).toThrow(
      'Tried to access data[1] but data len is: 1',
    );
  });
  it('throws on object with null key', () => {
    expect(() => decode(Buffer.from([103, 69, 69]))).toThrow(
      'Received invalid value for dictionary key: null',
    );
  });
});

describe('round trip', () => {
  const roundTrip = <T>(v: T) => decode(encode(v as never)) as T;

  it.each([
    ['type encoded positive integer', 1],
    ['type encoded negative integer', -5],
    ['byte positive integer', 46],
    ['byte negative integer', -47],
    ['short positive integer', 128],
    ['short negative integer', -129],
    ['long positive integer', 32768],
    ['long negative integer', -32769],
    ['bigger positive integer', 2 ** (8 * 4 - 1)],
    ['bigger negative integer', -(2 ** (8 * 4 - 1)) - 1],
    ['Huge positive integer', 9007199254740991],
    ['Huge negative integer', -9007199254740991],
    ['float', 1.123],
    ['bool true', true],
    ['bool false', false],
    ['null (None)', null],
    ['short string', 'aasdf'],
    [
      'long string',
      '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7',
    ],
    ['short array', [1, 'a', true]],
    ['emoji', '🤷'],
  ])('%s', (_name: string, value: unknown) => {
    expect(roundTrip(value)).toEqual(value);
  });

  it('long array (>= LIST_FIXED_COUNT)', () => {
    const v =
      '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7'.split(
        '',
      );
    expect(roundTrip(v)).toEqual(v);
  });

  it('small object', () => {
    const v = { a: 1, b: 'a', c: true };
    expect(roundTrip(v)).toEqual(v);
  });

  it('numeric-key object', () => {
    // Numeric keys serialize as strings in the rencoded dict.
    const v = { 1: 0 };
    expect(roundTrip(v)).toEqual(v);
  });

  it('long-string round-trip', () => {
    const s = 'string'.repeat(20);
    expect(roundTrip(s)).toEqual(s);
  });

  it('long-array round-trip', () => {
    const a = 'string'.repeat(20).split('');
    expect(roundTrip(a)).toEqual(a);
  });

  it('large object (>= DICT_FIXED_COUNT)', () => {
    const a = 'string'.repeat(20).split('');
    const o: Record<string, string> = {};
    a.forEach((v, i) => (o[i] = v));
    expect(roundTrip(o)).toEqual(o);
  });

  it('Float32 round-trip', () => {
    const f = 1.2000000476837158;
    expect(decode(encode(f, 32))).toEqual(f);
  });

  it('Decode long ASCII string with decodeUTF8=false', () => {
    const str =
      '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
    expect(decode(encode(str), false)).toEqual(str);
  });
});
