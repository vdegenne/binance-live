import tsc from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'

const minify = process.env.minify
console.log(minify)

export default {
  input: 'src/entry.ts',
  output: { file: 'docs/app.js', format: 'esm' },
  plugins: [cjs(), tsc(), resolve(),
    minify ? terser() : {}
  ]
}
