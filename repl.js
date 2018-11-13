const c = require('repl').start({ ignoreUndefined: true }).context;

const { encode, decode } = require('./rencode.js');

c.encode = encode;
c.decode = decode;
