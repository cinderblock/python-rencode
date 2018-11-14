// The intent is to match https://github.com/aresch/rencode

// Default number of bits for serialized floats, either 32 or 64 (also a parameter for dumps()).
const DEFAULT_FLOAT_BITS = 64;
// Maximum length of integer when written as base 10 string.
const MAX_INT_LENGTH = 64;

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
const CHR_TERM = 127;
// Positive integers with value embedded in typecode.
const INT_POS_FIXED_START = 0;
const INT_POS_FIXED_COUNT = 44;
// Dictionaries with length embedded in typecode.
const DICT_FIXED_START = 102;
const DICT_FIXED_COUNT = 25;
// Negative integers with value embedded in typecode.
const INT_NEG_FIXED_START = 70;
const INT_NEG_FIXED_COUNT = 32;
// Strings with length embedded in typecode.
const STR_FIXED_START = 128;
const STR_FIXED_COUNT = 64;
const LIST_FIXED_START = STR_FIXED_START + STR_FIXED_COUNT;
// Lists with length embedded in typecode.
const LIST_FIXED_COUNT = 64;

class Buff {
  constructor(buff) {
    if (buff instanceof Buff) throw Error('wrong constructor call');
    this.buff = buff;
    this.length = buff.length;
    this.pos = 0;
    this.append_char = this.append_char.bind(this);
    this.append_buff = this.append_buff.bind(this);
    this.slice = this.slice.bind(this);
  }
  static nextLength(needed) {
    return Math.round(needed * 6);
  }
  append_char(c) {
    const pos = this.length;
    this.length++;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    this.buff[pos] = c;
  }
  append_buff(b) {
    if (!(b instanceof Buff)) {
      if (!(b instanceof Buff)) {
        b = Buffer.from(b);
      }
      b = new Buff(b);
    }
    const pos = this.length;
    this.length += b.length;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    b.buff.copy(this.buff, pos, 0, b.length);
  }
  slice() {
    return this.buff.slice(0, this.length);
  }
}

function write_buffer_char(buffs, c) {
  buffs.append_char(c);
}

function write_buffer(buffs, data) {
  buffs.append_buff(data);
}

function encode_char(buffs, x) {
  if (0 <= x && x < INT_POS_FIXED_COUNT) write_buffer_char(buffs, INT_POS_FIXED_START + x);
  else if (-INT_NEG_FIXED_COUNT <= x && x < 0) write_buffer_char(buffs, INT_NEG_FIXED_START - 1 - x);
  else if (-128 <= x && x < 128) {
    write_buffer_char(buffs, CHR_INT1);
    write_buffer_char(buffs, x);
  }
}

function encode_short(buffs, x) {
  write_buffer_char(buffs, CHR_INT2);
  const buff = Buffer.allocUnsafe(2);
  buff.writeIntBE(x, 0, 2);
  write_buffer(buffs, buff);
}

function encode_int(buffs, x) {
  write_buffer_char(buffs, CHR_INT4);
  const buff = Buffer.allocUnsafe(4);
  buff.writeIntBE(x, 0, 4);
  write_buffer(buffs, buff);
}

function encode_long_long(buffs, x) {
  write_buffer_char(buffs, CHR_INT8);
  const buff = Buffer.allocUnsafe(8);
  buff[0] = buff[1] = 0;
  buff.writeIntBE(x, 2, 6);
  write_buffer(buffs, buff);
}

function encode_big_number(buffs, buff) {
  write_buffer_char(buffs, CHR_INT);
  write_buffer(buffs, buff);
  write_buffer_char(buffs, CHR_TERM);
}

function encode_float32(buffs, x) {
  write_buffer_char(buffs, CHR_FLOAT32);
  const buff = Buffer.allocUnsafe(4);
  buff.writeFloatBE(x, 0, 4);
  write_buffer(buffs, buff);
}

function encode_float64(buffs, x) {
  write_buffer_char(buffs, CHR_FLOAT64);
  const buff = Buffer.allocUnsafe(8);
  buff.writeDoubleBE(x, 0, 8);
  write_buffer(buffs, buff);
}

function encode_str(buffs, buff) {
  if (buff.length < STR_FIXED_COUNT) {
    write_buffer_char(buffs, STR_FIXED_START + buff.length);
    write_buffer(buffs, buff);
  } else {
    write_buffer(buffs, Buffer.from(buff.length + ':', 'ascii'));
    write_buffer(buffs, buff);
  }
}

function encode_none(buffs) {
  write_buffer_char(buffs, CHR_NONE);
}

function encode_bool(buffs, x) {
  write_buffer_char(buffs, x ? CHR_TRUE : CHR_FALSE);
}

function encode_list(buffs, x, float_bits) {
  if (x.length < LIST_FIXED_COUNT) {
    write_buffer_char(buffs, LIST_FIXED_START + x.length);
    x.forEach(i => encode(buffs, i, float_bits));
  } else {
    write_buffer_char(buffs, CHR_LIST);
    x.forEach(i => encode(buffs, i, float_bits));
    write_buffer_char(buffs, CHR_TERM);
  }
}

function encode_dict(buffs, x, float_bits) {
  const keys = Object.keys(x);
  if (keys.length < DICT_FIXED_COUNT) {
    write_buffer_char(buffs, DICT_FIXED_START + keys.length);
    keys.forEach(k => {
      encode(buffs, k, float_bits);
      encode(buffs, x[k], float_bits);
    });
  } else {
    write_buffer_char(buffs, CHR_DICT);
    keys.forEach(k => {
      encode(buffs, k, float_bits);
      encode(buffs, x[k], float_bits);
    });
    write_buffer_char(buffs, CHR_TERM);
  }
}

// 4 bytes
const MAX_SIGNED_INT = 2 ** (8 * 4 - 1);
const MIN_SIGNED_INT = -MAX_SIGNED_INT;

// Original implementation supports 8 byte number. Node Buffer write functions only go to 6.
const MAX_SIGNED_LONGLONG = 2 ** (8 * 6 - 1);
const MIN_SIGNED_LONGLONG = -MAX_SIGNED_LONGLONG;

function encode(buffs, data, float_bits) {
  switch (typeof data) {
    case 'number':
      if (Number.isInteger(data)) {
        if (-128 <= data && data < 128) encode_char(buffs, data);
        else if (-32768 <= data && data < 32768) encode_short(buffs, data);
        else if (MIN_SIGNED_INT <= data && data < MAX_SIGNED_INT) encode_int(buffs, data);
        else if (MIN_SIGNED_LONGLONG <= data && data < MAX_SIGNED_LONGLONG) {
          encode_long_long(buffs, data);
        } else {
          encode_big_number(buffs, '' + data);
        }
      } else {
        if (float_bits == 32) encode_float32(buffs, data);
        else encode_float64(buffs, data);
      }
      break;
    case 'string':
      encode_str(buffs, Buffer.from(data));
      break;

    case 'undefined':
      encode_none(buffs);
      break;

    case 'boolean':
      encode_bool(buffs, data);
      break;

    case 'object':
      if (data === null) throw Error('Trying to encode null');
      else if (Array.isArray(data)) encode_list(buffs, data, float_bits);
      else encode_dict(buffs, data, float_bits);
      break;

    default:
      throw Error('Cannot handle ' + typeof data);
  }
}

function dumps(data, float_bits = DEFAULT_FLOAT_BITS) {
  const ret = new Buff(Buffer.allocUnsafe(0));
  encode(ret, data, float_bits);
  return ret.slice();
}

function decode_char(data) {
  data.pos++;
  check_pos(data, data.pos);
  return data.buff.readIntBE(data.pos++, 1);
}

function decode_short(data) {
  check_pos(data, data.pos + 2);
  const ret = data.buff.readIntBE(data.pos + 1, 2);
  data.pos += 3;
  return ret;
}

function decode_int(data) {
  check_pos(data, data.pos + 4);
  const ret = data.buff.readIntBE(data.pos + 1, 4);
  data.pos += 5;
  return ret;
}

function decode_long_long(data) {
  check_pos(data, data.pos + 8);
  if (data.buff.readIntBE(data.pos + 1, 2) !== 0) throw Error('Encoded value outside of decodable range.');
  const ret = data.buff.readIntBE(data.pos + 3, 6);
  data.pos += 9;
  return ret;
}

function decode_fixed_pos_int(data) {
  data.pos += 1;
  return data.buff[data.pos - 1] - INT_POS_FIXED_START;
}

function decode_fixed_neg_int(data) {
  data.pos += 1;
  return (data.buff[data.pos - 1] - INT_NEG_FIXED_START + 1) * -1;
}

function decode_big_number(data) {
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

  big_number = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  return big_number;
}

function decode_float32(data) {
  check_pos(data, data.pos + 4);
  const ret = data.buff.readFloatBE(data.pos + 1, 4);
  data.pos += 5;
  return ret;
}

function decode_float64(data) {
  check_pos(data, data.pos + 8);
  const ret = data.buff.readDoubleBE(data.pos + 1, 8);
  data.pos += 9;
  return ret;
}

function decode_fixed_str(data, decode_utf8) {
  const size = data.buff[data.pos] - STR_FIXED_START + 1;
  check_pos(data, data.pos + size - 1);
  const s = data.buff.toString(decode_utf8 ? 'utf8' : 'ascii', data.pos + 1, data.pos + size);
  data.pos += size;
  return s;
}

function decode_str(data, decode_utf8) {
  let x = 1;
  check_pos(data, data.pos + x);
  // 58 is ascii ':'
  while (data.buff[data.pos + x] != 58) {
    x += 1;
    check_pos(data, data.pos + x);
  }

  let size = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  check_pos(data, data.pos + size - 1);
  s = data.buff.toString(decode_utf8 ? 'utf8' : 'ascii', data.pos, data.pos + size);
  data.pos += size;
  return s;
}

function decode_fixed_list(data, decode_utf8) {
  l = [];
  let size = data.buff[data.pos] - LIST_FIXED_START;
  data.pos += 1;
  while (size--) l.push(decode(data, decode_utf8));
  return l;
}

function decode_list(data, decode_utf8) {
  l = [];
  data.pos += 1;
  while (data.buff[data.pos] != CHR_TERM) l.push(decode(data, decode_utf8));
  data.pos += 1;
  return l;
}

function decode_fixed_dict(data, decode_utf8) {
  d = {};
  let size = data.buff[data.pos] - DICT_FIXED_START;
  data.pos += 1;
  while (size--) {
    const key = decode(data, decode_utf8);
    const value = decode(data, decode_utf8);
    d[key] = value;
  }
  return d;
}

function decode_dict(data, decode_utf8) {
  d = {};
  data.pos += 1;
  check_pos(data, data.pos);
  while (data.buff[data.pos] != CHR_TERM) {
    let key = decode(data, decode_utf8);
    let value = decode(data, decode_utf8);
    d[key] = value;
  }
  data.pos += 1;
  return d;
}

function check_pos(data, pos) {
  if (pos >= data.length) throw Error('Tried to access data[' + pos + '] but data len is: ' + data.length);
}

function decode(data, decode_utf8) {
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
    return decode_fixed_list(data);
  else if (typecode == CHR_LIST) return decode_list(data);
  else if (DICT_FIXED_START <= typecode && typecode < DICT_FIXED_START + DICT_FIXED_COUNT)
    return decode_fixed_dict(data);
  else if (typecode == CHR_DICT) return decode_dict(data);
}

function loads(data, decode_utf8 = false) {
  return decode(new Buff(data), decode_utf8);
}

module.exports = { encode: dumps, decode: loads };
