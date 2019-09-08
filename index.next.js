import erre from 'erre'
import pathToRegexp from 'path-to-regexp'

// create the streaming router
export const router = erre()

// check whether the window object is defined
export const hasWindow = () => typeof window !== 'undefined'

// url constructor
export const parseURL = (...args) => hasWindow() ? new URL(...args) : require('url').parse(...args)

/* @type {object} general configuration object */
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
  const [, ...matches] = pathRegExp.exec(path)
  const url = parseURL(path, base)

  // extend the url object adding the matches
  url.matches = matches

  return url
}

/**
 * Return true if a path will be matched
 * @param   {string} path - target path
 * @param   {RegExp} pathRegExp - path transformed to regex via pathToRegexp
 * @returns {boolean} true if the path matches the regexp
 */
export const match = (path, pathRegExp) => pathRegExp.test(path)
