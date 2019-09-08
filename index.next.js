import erre from 'erre'
import pathToRegexp from 'path-to-regexp'

// check whether the window object is defined
const hasWindow = () => typeof window !== 'undefined'

// the url parsing function depends on the platform, on node we rely on the 'url' module
const parseURL = (...args) => hasWindow() ? new URL(...args) : require('url').parse(...args)

/**
 * Replace the base path from a path
 * @param   {string} path - router path string
 * @returns {string} path cleaned up without the base
 */
const replaceBase = path => defaults.base ? path.replace(defaults.base, '') : path

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

// create the streaming router
export const router = erre(String) // cast the values of this stream always to string

/* @type {object} general configuration object */
export const defaults = {
  // custom option
  base: '',
  // pathToRegexp options
  sensitive: false,
  strict: false,
  end: true,
  start: true,
  delimiter: '/',
  endsWith: undefined,
  whitelist: undefined
}

/**
 * Merge the user options with the defaults
 * @param   {Object} options - custom user options
 * @returns {Object} options object merged with defaults
 */
export const mergeOptions = options => ({...defaults, ...options})

/* {@link https://github.com/pillarjs/path-to-regexp#compile-reverse-path-to-regexp} */
export const compile = (path, options) => pathToRegexp.compile(path, mergeOptions(options))

/* {@link https://github.com/pillarjs/path-to-regexp#usage} */
export const toRegexp = (path, keys, options) => pathToRegexp(path, keys, mergeOptions(options))

/**
 * Convert a router entry to a real path computing the url parameters
 * @param   {string} path - router path string
 * @param   {Object} params - named matched parameters
 * @param   {Object} options - pathToRegexp options object
 * @returns {string} computed url string
 */
export const toPath = (path, params, options) => compile(path, options)(params)

/**
 * Parse a string path generating an object containing
 * @param   {string} path - target path
 * @param   {RegExp} pathRegExp - path transformed to regex via pathToRegexp
 * @param   {Object} options - object containing the base path
 * @returns {URL} url object enhanced with the `match` attribute
 */
export const parse = (path, pathRegExp, options) => {
  const {base} = mergeOptions(options)
  const [, ...params] = pathRegExp.exec(path)
  const url = parseURL(path, base)

  // extend the url object adding the matched params
  url.params = params

  return url
}

/**
 * Return true if a path will be matched
 * @param   {string} path - target path
 * @param   {RegExp} pathRegExp - path transformed to regex via pathToRegexp
 * @returns {boolean} true if the path matches the regexp
 */
export const match = (path, pathRegExp) => pathRegExp.test(path)

/**
 * Create a fork of the main router stream
 * @param   {string} path - route to match
 * @param   {Object} options - pathToRegexp options object
 * @returns {Stream} new route stream
 */
export default function createRoute(path, options) {
  const pathRegExp = pathToRegexp(path)
  const matchOrSkip = path => (match(path, pathRegExp)) ? path : erre.cancel()
  const parseRoute = path => parse(path, pathRegExp, options)

  return joinStreams(router, erre(
    replaceBase,
    matchOrSkip,
    parseRoute
  ))
}
