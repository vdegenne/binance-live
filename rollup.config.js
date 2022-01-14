import tsc from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/entry.ts',
  output: { file: 'public/app.js', format: 'esm' },
  plugins: [cjs(), tsc(), resolve()]
}