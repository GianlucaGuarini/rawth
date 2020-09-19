import {compile, pathToRegexp} from 'path-to-regexp'
import erre from 'erre'

// check whether the window object is defined
const isNode = typeof process !== 'undefined'
const isString = str => typeof str === 'string'

// the url parsing function depends on the platform, on node we rely on the 'url' module
/* istanbul ignore next */
const parseURL = (...args) => isNode ? require('url').parse(...args) : new URL(...args)

/**
 * Replace the base path from a path
 * @param   {string} path - router path string
 * @returns {string} path cleaned up without the base
 */
const replaceBase = path => path.replace(defaults.base, '')

/**
 * Try to match the current path or skip it
 * @param   {RegEx} pathRegExp - target path transformed by pathToRegexp
 * @returns {string|Symbol} if the path match we return it otherwise we cancel the stream
 */
const matchOrSkip = pathRegExp => path => match(path, pathRegExp) ? path : erre.cancel()

/**
 * Combine 2 streams connecting the events of dispatcherStream to the receiverStream
 * @param   {Stream} dispatcherStream - main stream dispatching events
 * @param   {Stream} receiverStream - sub stream receiving events from the dispatcher
 * @returns {Stream} receiverStream
 */
const joinStreams = (dispatcherStream, receiverStream) => {
  dispatcherStream.on.value(receiverStream.push)

  receiverStream.on.end(() => {
    dispatcherStream.off.value(receiverStream.push)
  })

  return receiverStream
}

/**
 * Error handling function
 * @param   {Error} error - error to catch
 * @returns {void}
 */
const panic = error => {
  if (defaults.silentErrors) return

  throw new Error(error)
}

// make sure that the router will always receive strings params
export const filterStrings = str => isString(str) ? str : erre.cancel()

// create the streaming router
export const router = erre(filterStrings).on.error(panic) // cast the values of this stream always to string

/* @type {object} general configuration object */
export const defaults = {
  // custom option
  base: '',
  silentErrors: false,
  // pathToRegexp options
  sensitive: false,
  strict: false,
  end: true,
  start: true,
  delimiter: '/#?',
  encode: undefined,
  endsWith: undefined,
  prefixes: './'
}

/**
 * Merge the user options with the defaults
 * @param   {Object} options - custom user options
 * @returns {Object} options object merged with defaults
 */
export const mergeOptions = options => ({...defaults, ...options})

/* {@link https://github.com/pillarjs/path-to-regexp#usage} */
export const toRegexp = (path, keys, options) => pathToRegexp(path, keys, mergeOptions(options))

/**
 * Convert a router entry to a real path computing the url parameters
 * @param   {string} path - router path string
 * @param   {Object} params - named matched parameters
 * @param   {Object} options - pathToRegexp options object
 * @returns {string} computed url string
 */
export const toPath = (path, params, options) => compile(path, mergeOptions(options))(params)

/**
 * Parse a string path generating an object containing
 * @param   {string} path - target path
 * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
 * @param   {Object} options - object containing the base path
 * @returns {URL} url object enhanced with the `match` attribute
 */
export const toURL = (path, pathRegExp, options = {}) => {
  const {base} = mergeOptions(options)
  const [, ...params] = pathRegExp.exec(path)
  const url = parseURL(path, base)

  // extend the url object adding the matched params
  url.params = params.reduce((acc, param, index) => {
    const key = options.keys && options.keys[index]
    if (key) acc[key.name] = param
    return acc
  }, {})

  return url
}

/**
 * Return true if a path will be matched
 * @param   {string} path - target path
 * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
 * @returns {boolean} true if the path matches the regexp
 */
export const match = (path, pathRegExp) => pathRegExp.test(path)

/**
 * Factory function to create an sequence of functions to pass to erre.js
 * This function will be used in the erre stream
 * @param   {RegExp} pathRegExp - path transformed to regexp via pathToRegexp
 * @param   {Object} options - pathToRegexp options object
 * @returns {Array} a functions array that will be used as stream pipe for erre.js
 */
export const createURLStreamPipe = (pathRegExp, options) => [
  replaceBase,
  matchOrSkip(pathRegExp, options),
  path => toURL(path, pathRegExp, options)
]

/**
 * Create a fork of the main router stream
 * @param   {string} path - route to match
 * @param   {Object} options - pathToRegexp options object
 * @returns {Stream} new route stream
 */
export default function createRoute(path, options) {
  const keys = []
  const pathRegExp = pathToRegexp(path, keys, options)
  const URLStream = erre(...createURLStreamPipe(pathRegExp, {
    ...options,
    keys
  }))

  return joinStreams(router, URLStream).on.error(panic)
}
