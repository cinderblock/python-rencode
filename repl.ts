const c = require('repl').start({ ignoreUndefined: true }).context;

const { encode, decode } = require('.');

c.encode = encode;
c.decode = decode;
