import { PythonShell } from 'python-shell';

import { decode, RencodableData } from '../src/rencode';

const pyShell = new PythonShell('tests/lib/encode.py', {
  formatter: (data: RencodableData) => JSON.stringify(data),
  parser: (hex: string) => decode(Buffer.from(hex, 'hex')),
  pythonPath: 'python',
});

function transfer(data: RencodableData) {
  return new Promise<RencodableData>(resolve =>
    pyShell.once('message', resolve).send(<{}>data)
  );
}

[
  // Test type encoded integers
  1,
  -5,
  // Test byte integers
  46,
  -47,
  // Test short integers
  128,
  -129,
  // Test long integers
  32768,
  -32769,
  // Test bigger integers
  2 ** (8 * 4 - 1),
  //   -(2 ** (8 * 4 - 1)) - 1,
  // Test Huge integers
  //   9007199254740991,
  //   -9007199254740991,
  // Test float
  1.1230000257492065,
  // Test bool true
  true,
  // Test bool false
  false,
  // Test undefined (None)
  //   undefined,
  // Test short string
  'aasdf',
  // Test long string
  '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7',
  // Test short array
  [1, 'a', true],
  // Test long array
  '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7'.split(
    ''
  ),
  // Test small object
  { a: 1, b: 'a', c: true },

  // Test big object
  { 1: 0 },

  // Test emoji
  '🤷',
].forEach(v =>
  test('Test encoded by python, decoded by node: ' + v, async () => {
    expect(await transfer(v)).toEqual(v);
  })
);

const s = 'string'.repeat(20);
const a = s.split('');
const o = <any>{};
a.forEach((v, i) => (o[i] = v));

test('Encode and Decode Long String', async () => {
  expect(await transfer(s)).toEqual(s);
});
test('Encode and Decode Long Array', async () => {
  expect(await transfer(a)).toEqual(a);
});
test('Encode and Decode Large Object', async () => {
  expect(await transfer(o)).toEqual(o);
});

// test('Encode and Decode Float32', async () => {
//   const f = 1.2000000476837158;
//   expect(await transfer(f)).toEqual(f);
// });

// test('Decode long ascii string', () => {
//   const str =
//     '9ash9f786hjf9ad8fhadf8967hsadf687hasd8f9hdsf8a6gf7h9df67hdhs8f6hsadf876ah5df786asgfdh96fhasdf8967hjasf89h6df7';
//     expect(await transfer(str, false)).toEqual(str);
// });
