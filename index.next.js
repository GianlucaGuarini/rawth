import erre from 'erre'
import fromDOM from 'erre.fromdom'
import pathToRegexp from 'path-to-regexp'

// dom events
const POPSTATE = 'popstate'
const HASHCHANGE = 'hashchange'
const HASH = '#'

/**
 * Combine 2 streams connecting the events of dispatcherStream to the receiverStream
 * @private
 * @param   {Stream} dispatcherStream - main stream dispatching events
 * @param   {Stream} receiverStream - sub stream receiving events from the dispatcher
 * @returns {Stream} receiverStream
 */
function combine(dispatcherStream, receiverStream) {
  dispatcherStream.on.value(receiverStream.push)

  receiverStream.on.end(() => {
    dispatcherStream.off.value(receiverStream.push)
  })

  return receiverStream
}

// just return the current window location
const readWindowLocation = () => window.location

// check whether the window object is defined
export const hasWindow = () => typeof window !== 'undefined'

// create the streaming router
export const router = hasWindow() ?
  fromDOM(window, `${POPSTATE} ${HASHCHANGE}`).connect(readWindowLocation) :
  erre()

// url constructor
export const parseURL = (...args) => hasWindow() ? new URL(...args) : require('url').parse(...args)

// general configuration object
export const defaults = {
  // custom option
  base: undefined,
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
 * Replace the base path from a path
 * @param   {string} path - router path string
 * @returns {string} path cleaned up without the base
 */
export const replaceBase = path => defaults.base ? path.replace(defaults.base, '') : path

/**
 * Replace the hash char at beginning of a route
 * @param   {string} path - router path string
 * @returns {string} path cleaned up without the base
 */
export const replaceHash = path => path.startsWith(HASH) ? path.substring(1) : path

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
 * @returns {Stream} route stream
 */
export default function createRoute(path, options) {
  const pathRegExp = pathToRegexp(path)
  const matchOrSkip = path => {
    if (match(path, pathRegExp)) return path
    return erre.cancel()
  }
  const parseRoute = path => parse(path, pathRegExp, options)

  return combine(router, erre(
    replaceBase,
    replaceHash,
    matchOrSkip,
    parseRoute
  ))
}
