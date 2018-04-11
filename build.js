const path = require('path');

const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
//const uglify = require('rollup-plugin-uglify');

//const: source path & dist path
const srcRoot = path.resolve(__dirname, 'src');
const distRoot = path.join(__dirname, 'dist');

const input = path.join(srcRoot, 'index.js');
const output = path.join(distRoot, 'sparrow-claw.js');

async function processScript() {
  try {
    let bundle = await rollup.rollup({
      input,
      plugins: [resolve(), babel()]
    });
    await bundle.write({
      name: 'SparrowClaw',
      format: 'umd',
      file: output
    });
    console.log('done.');
  } catch (error) {
    console.error(error);
  }
}

async function processEntry() {
  await processScript();
}

processEntry();
