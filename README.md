# rawth

Pure functional isomorphic router based on streams

[![Build Status][travis-image]][travis-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![Coverage Status][coverage-image]][coverage-url]
![rawth size][lib-size]
[![MIT License][license-image]][license-url]

## Usage

### In Browsers
```js
import route from 'rawth'

route('/users/:user').on.value(({params}) => {
  const [user] = params

  console.log(`Hello dear ${user}`)
})

// just use the browser history.pushState event to dispatch router events
history.pushState({ page: 1 }, 'Users Page', '/users/gianluca')
```

### In node

```js
import route, { router } from 'rawth'

route('/users/:user').on.value(({params}) => {
  const [user] = params

  console.log(`Hello dear ${user}`)
})

// you can dispatch router events also innode
router.push('/users/gianluca')
```

[travis-image]:https://img.shields.io/travis/GianlucaGuarini/rawth.svg?style=flat-square
[travis-url]:https://travis-ci.org/GianlucaGuarini/rawth

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[lib-size]: https://img.badgesize.io/https://unpkg.com/rawth/rawth.min.js?compression=gzip

[npm-version-image]:http://img.shields.io/npm/v/rawth.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/rawth.svg?style=flat-square
[npm-url]:https://npmjs.org/package/rawth

[coverage-image]:https://img.shields.io/coveralls/GianlucaGuarini/rawth/maser.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/GianlucaGuarini/rawth?branch=dev

[codeclimate-image]:https://api.codeclimate.com/v1/badges/5a4b8cf4736254115cb3/maintainability
[codeclimate-url]:https://codeclimate.com/github/GianlucaGuarini/rawth/maintainability

