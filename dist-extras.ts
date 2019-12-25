import { promises as fs } from 'fs';
import jq = require('node-jq');

const distDir = 'dist';

const packageJsonFilename = 'package.json';
const packageOut = `${distDir}/${packageJsonFilename}`;

const readmeFilename = 'README.md';
const readmeOut = `${distDir}/${readmeFilename}`;

async function packageJsonDist() {
  const packageFilter = [
    'del(.private)',
    'del(.scripts)',
    'del(.devDependencies)',
    'setpath(["main"]; "rencode.js")',
    'setpath(["types"]; "rencode.d.ts")',
  ].join(' | ');

  const packageJson = await jq.run(packageFilter, packageJsonFilename);

  return fs.writeFile(packageOut, packageJson);
}

async function readmeDist() {
  const file = await fs.readFile(readmeFilename);

  let out = '';

  let enabled = true;

  for (const line of file.toString('utf8').split('\n')) {
    // Filter everything after NOPUBLISH line. npm users don't need the development section of the readme.
    if (line.trim() == '<!-- NOPUBLISH -->') enabled = false;

    if (enabled) out += line + '\n';
  }

  // Only 1 newline at the end
  out = out.trimRight() + '\n';

  return fs.writeFile(readmeOut, out);
}

async function extras() {
  await fs.mkdir(distDir).catch(() => {});

  return Promise.all([packageJsonDist(), readmeDist()]);
}

extras();
