<p align="righ">
  <img src="https://raw.githubusercontent.com/GianlucaGuarini/rawth/master/rawth-logo.png" alt="rawth"/>
</p>


##### Pure functional isomorphic router based on streams. It works consistently on modern browsers and on node.

---


[![Build Status][ci-image]][ci-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![Coverage Status][coverage-image]][coverage-url]
![rawth size][lib-size]
[![MIT License][license-image]][license-url]

## Usage

Any `rawth.route` function creates an [erre stream](https://github.com/GianlucaGuarini/erre) connected to the main router stream. These sub-streams will be activated only when their paths will match the current router path. For example:

```js
import route, { router } from 'rawth'

route('/users/:user').on.value(({params}) => {
  const {user} = params

  console.log(`Hello dear ${user}`)
})

// you can dispatch router events at any time
router.push('/users/gianluca')
```

The argument passed to the subscribed functions is an [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object having `params` as additional property. The `params` array will contain all the matched [route parameters](https://github.com/pillarjs/path-to-regexp#parameters)

```js
import route, { router } from 'rawth'

route('/:group/:user').on.value(({params}) => {
  const {group, user} = params

  console.log(`Hello dear ${user}, you are part of the ${group} group`)
})

// you can dispatch router events at any time
router.push('/friends/gianluca')
```

### Unsubscribe streams

If you want to unsubscribe to a specific route you need just to end the stream

```js
import route from 'rawth'

const usersRouteStream = route('/users/:user')

// subscribe to the stream as many times as you want
usersRouteStream.on.value(({params}) => { /* */ })
usersRouteStream.on.value(({params}) => { /* */ })
usersRouteStream.on.value(({params}) => { /* */ })

// end the stream
usersRouteStream.end()
```

### Set the base path

You can set the base path and override the router default options using the `configure` method

```js
import { configure } from 'rawth'

configure({
  base: 'https://example.com',
  strict: true
})

```

[ci-image]:https://github.com/GianlucaGuarini/rawth/actions/workflows/test.yml/badge.svg
[ci-url]:https://github.com/GianlucaGuarini/rawth/actions/workflows/test.yml

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[lib-size]:https://img.badgesize.io/https://unpkg.com/rawth/rawth.min.js?compression=gzip

[npm-version-image]:http://img.shields.io/npm/v/rawth.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/rawth.svg?style=flat-square
[npm-url]:https://npmjs.org/package/rawth

[coverage-image]:https://img.shields.io/coveralls/GianlucaGuarini/rawth/main.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/GianlucaGuarini/rawth?branch=main

[codeclimate-image]:https://api.codeclimate.com/v1/badges/5a4b8cf4736254115cb3/maintainability
[codeclimate-url]:https://codeclimate.com/github/GianlucaGuarini/rawth/maintainability
