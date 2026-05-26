import { PythonShell } from 'python-shell';
import { encode, RencodableData } from '..';

function decodeWithPython(data: RencodableData) {
  const pyShell = new PythonShell('tests/lib/decode.py');

  return new Promise<RencodableData>((resolve, reject) => {
    pyShell.on('error', reject);

    // TODO: Do we need to check for chunked messages?
    pyShell.once('message', hexJson => {
      resolve(JSON.parse(Buffer.from(hexJson, 'hex').toString('utf8')));
      pyShell.end((err, exitCode, exitSignal) => {
        if (err) console.log('Error ending:', err);
        else if (exitCode) {
          console.log('Exit code:', exitCode, 'Signal:', exitSignal);
        } else {
        }
      });
    });

    pyShell.send(encode(data).toString('hex'));
  });
}

test('type encoded positive integer', async () => {
  const v = 1;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('type encoded negative integer', async () => {
  const v = -5;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('byte positive integer', async () => {
  const v = 46;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('byte negative integer', async () => {
  const v = -47;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('short positive integer', async () => {
  const v = 128;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('short negative integer', async () => {
  const v = -129;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('long positive integer', async () => {
  const v = 32768;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('long negative integer', async () => {
  const v = -32769;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('bigger positive integer', async () => {
  const v = 2 ** (8 * 4 - 1);
  expect(await decodeWithPython(v)).toEqual(v);
});

// test('bigger negative integer', async () => {
//   const v = -(2 ** (8 * 4 - 1)) - 1;
//   expect(await decodeWithPython(v)).toEqual(v);
// });

// test('Huge positive integer', async () => {
//   const v = 9007199254740991;
//   expect(await decodeWithPython(v)).toEqual(v);
// });

// test('Huge negative integer', async () => {
//   const v = -9007199254740991;
//   expect(await decodeWithPython(v)).toEqual(v);
// });

test('float', async () => {
  const v = 1.125;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('bool true', async () => {
  const v = true;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('bool false', async () => {
  const v = false;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('null (None)', async () => {
  const v = null;
  expect(await decodeWithPython(v)).toEqual(v);
});

test('short string', async () => {
  const v = 'aasdf';
  expect(await decodeWithPython(v)).toEqual(v);
});

test('long string', async () => {
  const v =
    '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
  expect(await decodeWithPython(v)).toEqual(v);
});

test('short array', async () => {
  const v = [1, 'a', true];
  expect(await decodeWithPython(v)).toEqual(v);
});

test('long array', async () => {
  const v = '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7'.split(
    ''
  );
  expect(await decodeWithPython(v)).toEqual(v);
});

test('small object', async () => {
  const v = { a: 1, b: 'a', c: true };
  expect(await decodeWithPython(v)).toEqual(v);
});

// test('big object', async () => {
//   // TODO: Make this object bigger
//   const v = { 1: 0 };
//   expect(await decodeWithPython(v)).toEqual(v);
// });

test('emoji', async () => {
  const v = '🤷';
  expect(await decodeWithPython(v)).toEqual(v);
});

const s = 'string'.repeat(20);
const a = s.split('');
const o = <any>{};
a.forEach((v, i) => (o[i] = v));

test('Encode and Decode Long String', async () => {
  expect(await decodeWithPython(s)).toEqual(s);
});
test('Encode and Decode Long Array', async () => {
  expect(await decodeWithPython(a)).toEqual(a);
});
test('Encode and Decode Large Object', async () => {
  expect(await decodeWithPython(o)).toEqual(o);
});

test('Encode and Decode Float32', async () => {
  const f = 1.2000000476837158;
  expect(await decodeWithPython(f)).toEqual(f);
});

test('Decode long ascii string', async () => {
  const str =
    '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
  expect(await decodeWithPython(str)).toEqual(str);
});
