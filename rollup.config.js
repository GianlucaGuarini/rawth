import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'index.next.js',
  plugins: [
    commonjs(),
    resolve({
      jsnext: true
    }),
    terser({
      include: [/^.+\.min\.js$/]
    })
  ],
  output: [
    {
      name: 'rawth',
      file: 'rawth.js',
      format: 'umd'
    },
    {
      name: 'rawth',
      file: 'rawth.min.js',
      format: 'umd'
    }
  ]
}