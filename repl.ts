const c = require('repl').start({ ignoreUndefined: true }).context;

const { encode, decode } = require('./rencode');

c.encode = encode;
c.decode = decode;
