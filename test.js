import route, {
  configure,
  defaults,
  match,
  router,
  toPath,
  toRegexp,
  toURL
} from './index.next.js'
import erre from 'erre'
import {expect} from 'chai'

describe('rawth', function() {
  it('the default options will be exported', () => {
    expect(defaults).to.be.ok
  })

  it('the default options can be configured', () => {
    expect(defaults.base).to.be.equal('https://localhost')
    configure({
      base: 'http://localhost'
    })
    expect(defaults.base).to.be.equal('http://localhost')
    configure({
      base: 'https://localhost'
    })
    expect(defaults.base).to.be.equal('https://localhost')
  })

  it('the toPath method returns valid string paths', () => {
    expect(toPath('/:foo/:bar', {foo: 'foo', bar: 'bar'}))
      .to.be.equal('/foo/bar')
  })

  it('the toURL method will return a proper URL object', () => {
    const keys = []
    const path = toRegexp(':foo/:bar', keys)
    const url = toURL('foo/bar', path, {keys})

    expect(url.pathname).to.be.equal('/foo/bar')
    expect(url.hostname).to.be.equal('localhost')
    expect(url.protocol).to.be.equal('https:')
    expect(url.params.foo).to.be.equal('foo')
    expect(url.params.bar).to.be.equal('bar')
  })

  it('the toURL method will provide undefined for empty optional parameters', () => {
    const keys = []

    const path = toRegexp(':foo?/:bar?', keys)
    const url = toURL('foo', path, {keys})

    expect(url.params.foo).to.be.equal('foo')
    expect(url.params.bar).to.be.equal(undefined)
  })

  it('the match method will return true only for the routes matching the test regex', () => {
    const path = toRegexp('/:foo/:bar')

    expect(match('/foo/bar', path)).to.be.ok
    expect(match('/foo/bar/', path)).to.be.ok
    expect(match('/foo', path)).to.be.not.ok
  })

  it('the streaming router gets exported', () => {
    expect(router).to.be.ok
  })

  it('the hash routes can be matched as well', (done) => {
    const fooBarStream = route('#:foo/:bar')

    fooBarStream.on.value(({params, hash}) => {
      expect(params.foo).to.be.equal('foo')
      expect(params.bar).to.be.equal('bar')
      expect(hash).to.be.equal('#foo/bar')

      fooBarStream.end()

      done()

      return erre.off()
    })

    router.push('#foo/bar')
  })

  it('a subroute stream gets properly created', done => {
    const fooBarStream = route(':foo/:bar')

    fooBarStream.on.value(({params}) => {
      expect(params.foo).to.be.equal('foo')
      expect(params.bar).to.be.equal('bar')

      fooBarStream.end()

      done()

      return erre.off()
    })

    router.push('foo/bar')
  })

  it('subroute streams don\'t get called if the route doesn\'t match', () => {
    const fooBarStream = route(':foo/:bar')
    const fail = () => expect.fail('you should never get here')

    fooBarStream.on.value(fail)
    router.push('foo')
    fooBarStream.off.value(fail)
  })

  it('encoded URIs will be decoded with decodeURI', done => {
    const fooBarStream = route(':foo/:bar\\?(.*)')

    fooBarStream.on.value((path) => {
      expect(path.params.foo).to.be.equal('foo')
      expect(path.params.bar).to.be.equal('ba r')
      expect(path.search).to.be.equal('?x=test&y=%C3%A9')

      fooBarStream.end()

      done()

      return erre.off()
    })

    router.push('foo/ba%20r?x=test&y=%C3%A9')
  })

  it('encoded path elements (but NOT query) will be decoded with decodeURIComponent', done => {
    const fooBarStream = route(':foo/:bar\\?(.*)')

    fooBarStream.on.value((path) => {
      expect(path.params.foo).to.be.equal('foo;v=1')
      expect(path.params.bar).to.be.equal('ba&r')
      // NOTE: decodeURIComponent() would also decode component separators such as /, ?, &
      // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
      expect(path.search).to.be.equal('?y=%26&z=end')  // %26 is &

      fooBarStream.end()

      done()

      return erre.off()
    })

    router.push('foo;v=1/ba%26r?y=%26&z=end')
  })

  it('bypass router arguments different from strings', (done) => ((count = 0) => {
    const increment = () => ++count

    router.on.value(increment)

    router.push('foo/baz')
    router.push(Symbol())

    setTimeout(() => {
      expect(count).to.be.equal(1)
      router.off.value(increment)
      done()
    }, 100)
  })())
})
