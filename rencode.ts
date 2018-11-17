'use strict';

// The intent is to match https://github.com/aresch/rencode

// Maximum length of integer when written as base 10 string.
const MAX_INT_LENGTH = 64;

// Positive integers with value embedded in typecode.
const INT_POS_FIXED_START = 0;
const INT_POS_FIXED_COUNT = 44;

// [49,57] is used to test if type is a string.

// The bencode 'typecodes' such as i, d, etc have been extended and
// relocated on the base-256 character set.
const CHR_LIST = 59;
const CHR_DICT = 60;
const CHR_INT = 61;
const CHR_INT1 = 62;
const CHR_INT2 = 63;
const CHR_INT4 = 64;
const CHR_INT8 = 65;
const CHR_FLOAT32 = 66;
const CHR_FLOAT64 = 44;
const CHR_TRUE = 67;
const CHR_FALSE = 68;
const CHR_NONE = 69;
// Negative integers with value embedded in typecode.
const INT_NEG_FIXED_START = 70;
const INT_NEG_FIXED_COUNT = 32;
// Dictionaries with length embedded in typecode.
const DICT_FIXED_START = 102;
const DICT_FIXED_COUNT = 25;
const CHR_TERM = 127;
// Strings with length embedded in typecode.
const STR_FIXED_START = 128;
const STR_FIXED_COUNT = 64;
const LIST_FIXED_START = STR_FIXED_START + STR_FIXED_COUNT;
// Lists with length embedded in typecode.
const LIST_FIXED_COUNT = 64;

class Buff {
  buff: Buffer;
  length: number;
  pos: number;

  constructor(buff?: Buffer) {
    this.buff = buff || Buffer.allocUnsafe(0);
    this.length = this.buff.length;
    this.pos = 0;
    this.append_char = this.append_char.bind(this);
    this.append_buff = this.append_buff.bind(this);
    this.slice = this.slice.bind(this);
  }

  static nextLength(needed: number): number {
    return Math.round(needed * 6);
  }

  append_char(c: number) {
    const pos = this.length;
    this.length++;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    this.buff[pos] = c;
  }

  append_buff(b: Buffer) {
    const pos = this.length;
    this.length += b.length;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    b.copy(this.buff, pos, 0, b.length);
  }

  slice() {
    return this.buff.slice(0, this.length);
  }
}

function write_buffer_char(buffs: Buff, c: number) {
  buffs.append_char(c);
}

function write_buffer(buffs: Buff, data: Buffer) {
  buffs.append_buff(data);
}

function encode_char(buffs: Buff, x: number) {
  if (0 <= x && x < INT_POS_FIXED_COUNT) write_buffer_char(buffs, INT_POS_FIXED_START + x);
  else if (-INT_NEG_FIXED_COUNT <= x && x < 0) write_buffer_char(buffs, INT_NEG_FIXED_START - 1 - x);
  else {
    write_buffer_char(buffs, CHR_INT1);
    write_buffer_char(buffs, x);
  }
}

function encode_short(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_INT2);
  const buff = Buffer.allocUnsafe(2);
  buff.writeIntBE(x, 0, 2);
  write_buffer(buffs, buff);
}

function encode_int(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_INT4);
  const buff = Buffer.allocUnsafe(4);
  buff.writeIntBE(x, 0, 4);
  write_buffer(buffs, buff);
}

function encode_long_long(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_INT8);
  const buff = Buffer.allocUnsafe(8);
  buff[0] = buff[1] = 0;
  // writeIntBE can't do more than 6 bytes in node :-/
  buff.writeIntBE(x, 2, 6);
  write_buffer(buffs, buff);
}

function encode_big_number(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_INT);
  // TODO: Make sure this matches python
  write_buffer(buffs, Buffer.from('' + x));
  write_buffer_char(buffs, CHR_TERM);
}

function encode_float32(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_FLOAT32);
  const buff = Buffer.allocUnsafe(4);
  buff.writeFloatBE(x, 0);
  write_buffer(buffs, buff);
}

function encode_float64(buffs: Buff, x: number) {
  write_buffer_char(buffs, CHR_FLOAT64);
  const buff = Buffer.allocUnsafe(8);
  buff.writeDoubleBE(x, 0);
  write_buffer(buffs, buff);
}

function encode_str(buffs: Buff, str: string) {
  // JS strings are always utf8
  const buff = Buffer.from(str, 'utf8');

  if (buff.length < STR_FIXED_COUNT) {
    write_buffer_char(buffs, STR_FIXED_START + buff.length);
    write_buffer(buffs, buff);
  } else {
    write_buffer(buffs, Buffer.from(buff.length + ':', 'ascii'));
    write_buffer(buffs, buff);
  }
}

function encode_none(buffs: Buff) {
  write_buffer_char(buffs, CHR_NONE);
}

function encode_bool(buffs: Buff, x: boolean) {
  write_buffer_char(buffs, x ? CHR_TRUE : CHR_FALSE);
}

function encode_list(buffs: Buff, x: Data[], floatBits: FloatBits) {
  if (x.length < LIST_FIXED_COUNT) {
    write_buffer_char(buffs, LIST_FIXED_START + x.length);
    x.forEach(i => encode(buffs, i, floatBits));
  } else {
    write_buffer_char(buffs, CHR_LIST);
    x.forEach(i => encode(buffs, i, floatBits));
    write_buffer_char(buffs, CHR_TERM);
  }
}

function encode_dict(buffs: Buff, x: DataObject, floatBits: FloatBits) {
  const keys = Object.keys(x);
  if (keys.length < DICT_FIXED_COUNT) {
    write_buffer_char(buffs, DICT_FIXED_START + keys.length);
    keys.forEach(k => {
      encode(buffs, k, floatBits);
      encode(buffs, x[k], floatBits);
    });
  } else {
    write_buffer_char(buffs, CHR_DICT);
    keys.forEach(k => {
      encode(buffs, k, floatBits);
      encode(buffs, x[k], floatBits);
    });
    write_buffer_char(buffs, CHR_TERM);
  }
}

const SIZE = [
  2 ** (8 * 1 - 1), // 128
  2 ** (8 * 2 - 1), // 32768
  2 ** (8 * 4 - 1), // MAX_SIGNED_INT
  // Node Buffer write functions only go to 6 bytes
  2 ** (8 * 6 - 1), // MAX_SIGNED_LONG_LONG
];

function canNumberFitSize(x: number, bytes: number) {
  if (x < 0) x = -x - 1;
  return x < SIZE[bytes];
}

function encode_number(buffs: Buff, x: number, floatBits: FloatBits) {
  if (!Number.isInteger(x)) return floatBits == 32 ? encode_float32(buffs, x) : encode_float64(buffs, x);

  if (canNumberFitSize(x, 0)) return encode_char(buffs, x);
  if (canNumberFitSize(x, 1)) return encode_short(buffs, x);
  if (canNumberFitSize(x, 2)) return encode_int(buffs, x);
  if (canNumberFitSize(x, 3)) return encode_long_long(buffs, x);

  return encode_big_number(buffs, x);
}

type Data = number | string | undefined | boolean | DataObject | DataArray;

interface DataObject {
  [k: string]: Data;
  [k: number]: Data;
}
interface DataArray extends Array<Data> {}

function encode(buffs: Buff, data: Data, floatBits: FloatBits) {
  // typeof null === 'object' :-?
  if (data === null) throw Error('Cannot encode null');

  // typeof [] === 'object' :-/
  if (Array.isArray(data)) return encode_list(buffs, data, floatBits);

  switch (typeof data) {
    case 'number':
      return encode_number(buffs, data, floatBits);
    case 'string':
      return encode_str(buffs, data);
    case 'undefined':
      return encode_none(buffs);
    case 'boolean':
      return encode_bool(buffs, data);
    case 'object':
      return encode_dict(buffs, data, floatBits);
  }

  throw Error('Cannot encode ' + typeof data);
}

type FloatBits = 32 | 64;

function dumps(data: Data, floatBits: FloatBits = 64) {
  const ret = new Buff();
  encode(ret, data, floatBits);
  return ret.slice();
}

function decode_char(data: Buff): number {
  data.pos++;
  check_pos(data, data.pos);
  return data.buff.readIntBE(data.pos++, 1);
}

function decode_short(data: Buff): number {
  check_pos(data, data.pos + 2);
  const ret = data.buff.readIntBE(data.pos + 1, 2);
  data.pos += 3;
  return ret;
}

function decode_int(data: Buff): number {
  check_pos(data, data.pos + 4);
  const ret = data.buff.readIntBE(data.pos + 1, 4);
  data.pos += 5;
  return ret;
}

function decode_long_long(data: Buff): number {
  check_pos(data, data.pos + 8);
  if (data.buff.readIntBE(data.pos + 1, 2) !== 0) throw Error('Encoded value outside of decodable range.');
  const ret = data.buff.readIntBE(data.pos + 3, 6);
  data.pos += 9;
  return ret;
}

function decode_fixed_pos_int(data: Buff): number {
  data.pos += 1;
  return data.buff[data.pos - 1] - INT_POS_FIXED_START;
}

function decode_fixed_neg_int(data: Buff): number {
  data.pos += 1;
  return (data.buff[data.pos - 1] - INT_NEG_FIXED_START + 1) * -1;
}

function decode_big_number(data: Buff): number {
  data.pos += 1;
  let x = 1;
  check_pos(data, data.pos + x);
  while (data.buff[data.pos + x] != CHR_TERM) {
    x += 1;
    if (x >= MAX_INT_LENGTH) {
      throw Error('Number is longer than ' + MAX_INT_LENGTH + ' characters');
    }
    check_pos(data, data.pos + x);
  }

  const big_number = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  return big_number;
}

function decode_float32(data: Buff): number {
  check_pos(data, data.pos + 4);
  const ret = data.buff.readFloatBE(data.pos + 1);
  data.pos += 5;
  return ret;
}

function decode_float64(data: Buff): number {
  check_pos(data, data.pos + 8);
  const ret = data.buff.readDoubleBE(data.pos + 1);
  data.pos += 9;
  return ret;
}

function decode_fixed_str(data: Buff, decode_utf8: boolean): string {
  const size = data.buff[data.pos] - STR_FIXED_START + 1;
  check_pos(data, data.pos + size - 1);
  const s = data.buff.toString(decode_utf8 ? 'utf8' : 'ascii', data.pos + 1, data.pos + size);
  data.pos += size;
  return s;
}

function decode_str(data: Buff, decode_utf8: boolean): string {
  let x = 1;
  check_pos(data, data.pos + x);
  // 58 is ascii ':'
  while (data.buff[data.pos + x] != 58) {
    x += 1;
    check_pos(data, data.pos + x);
  }

  const size = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  check_pos(data, data.pos + size - 1);
  const s = data.buff.toString(decode_utf8 ? 'utf8' : 'ascii', data.pos, data.pos + size);
  data.pos += size;
  return s;
}

function decode_fixed_list(data: Buff, decode_utf8: boolean): DataArray {
  const l = [];
  let size = data.buff[data.pos] - LIST_FIXED_START;
  data.pos += 1;
  while (size--) l.push(decode(data, decode_utf8));
  return l;
}

function decode_list(data: Buff, decode_utf8: boolean): DataArray {
  const l = [];
  data.pos += 1;
  while (data.buff[data.pos] != CHR_TERM) l.push(decode(data, decode_utf8));
  data.pos += 1;
  return l;
}

function decode_key_value_pair(d: DataObject, data: Buff, decode_utf8: boolean): void {
  const key = decode(data, decode_utf8);
  const value = decode(data, decode_utf8);
  if (!(typeof key == 'string' || typeof key == 'number'))
    throw TypeError('Received invalid value for dictionary key: ' + key);
  d[key] = value;
}

function decode_fixed_dict(data: Buff, decode_utf8: boolean): DataObject {
  const d = {};
  let size = data.buff[data.pos] - DICT_FIXED_START;
  data.pos += 1;
  while (size--) decode_key_value_pair(d, data, decode_utf8);
  return d;
}

function decode_dict(data: Buff, decode_utf8: boolean): DataObject {
  const d = {};
  data.pos += 1;
  check_pos(data, data.pos);
  while (data.buff[data.pos] != CHR_TERM) decode_key_value_pair(d, data, decode_utf8);
  data.pos += 1;
  return d;
}

function check_pos(data: Buff, pos: number): void {
  if (pos >= data.length) throw Error('Tried to access data[' + pos + '] but data len is: ' + data.length);
}

function decode(data: Buff, decode_utf8: boolean): Data {
  if (data.pos >= data.length)
    throw Error('Malformed rencoded string: data_length: ' + data.length + ' pos: ' + data.pos);

  const typecode = data.buff[data.pos];

  if (typecode == CHR_INT1) return decode_char(data);
  else if (typecode == CHR_INT2) return decode_short(data);
  else if (typecode == CHR_INT4) return decode_int(data);
  else if (typecode == CHR_INT8) return decode_long_long(data);
  else if (INT_POS_FIXED_START <= typecode && typecode < INT_POS_FIXED_START + INT_POS_FIXED_COUNT)
    return decode_fixed_pos_int(data);
  else if (INT_NEG_FIXED_START <= typecode && typecode < INT_NEG_FIXED_START + INT_NEG_FIXED_COUNT)
    return decode_fixed_neg_int(data);
  else if (typecode == CHR_INT) return decode_big_number(data);
  else if (typecode == CHR_FLOAT32) return decode_float32(data);
  else if (typecode == CHR_FLOAT64) return decode_float64(data);
  else if (STR_FIXED_START <= typecode && typecode < STR_FIXED_START + STR_FIXED_COUNT)
    return decode_fixed_str(data, decode_utf8);
  else if (49 <= typecode && typecode <= 57) return decode_str(data, decode_utf8);
  else if (typecode == CHR_NONE) {
    data.pos += 1;
    return undefined;
  } else if (typecode == CHR_TRUE) {
    data.pos += 1;
    return true;
  } else if (typecode == CHR_FALSE) {
    data.pos += 1;
    return false;
  } else if (LIST_FIXED_START <= typecode && typecode < LIST_FIXED_START + LIST_FIXED_COUNT)
    return decode_fixed_list(data, decode_utf8);
  else if (typecode == CHR_LIST) return decode_list(data, decode_utf8);
  else if (DICT_FIXED_START <= typecode && typecode < DICT_FIXED_START + DICT_FIXED_COUNT)
    return decode_fixed_dict(data, decode_utf8);
  else if (typecode == CHR_DICT) return decode_dict(data, decode_utf8);
  else throw Error('Unexpected typecode received (' + typecode + ') at position ' + data.pos);
}

function loads(data: Buffer, decode_utf8: boolean = true): Data {
  return decode(new Buff(data), decode_utf8);
}

export { dumps as encode, dumps, loads as decode, loads };
