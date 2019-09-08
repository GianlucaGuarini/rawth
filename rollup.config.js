import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'index.next.js',
  plugins: [
    commonjs(),
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      name: 'rawth',
      file: 'rawth.js',
      format: 'umd'
    }
  ]
}