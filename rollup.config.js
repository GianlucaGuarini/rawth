import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'index.next.js',
  plugins: [
    commonjs(),
    nodeResolve()
  ],
  output: [
    {
      name: 'rawth',
      file: 'index.cjs',
      format: 'umd'
    },
    {
      name: 'rawth',
      file: 'index.js',
      format: 'es'
    }
  ]
}
