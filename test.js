import route, {
  compile,
  defaults,
  match,
  mergeOptions,
  parse,
  router,
  toPath,
  toRegexp
} from './index.next'
import {expect} from 'chai'

describe('rawth', function() {
  beforeEach(() => {
    // reset the base
    defaults.base = undefined
  })

  it('the options can be properly merged', () => {
    const options = mergeOptions({foo: 'foo', base: 'buz'})

    expect(options.foo).to.be.equal('foo')
    expect(options.base).to.be.equal('buz')
  })

  it('the default options will be exported', () => {
    expect(defaults).to.be.ok
  })

  it('the compile method returns valid string paths', () => {
    const customToPath = compile('http://example.com/:foo/:bar')

    expect(customToPath({ foo: 'foo', bar: 'bar' })).to.be.equal('http://example.com/foo/bar')
  })

  it('the toPath method returns valid string paths', () => {
    expect(toPath('http://example.com/:foo/:bar',{ foo: 'foo', bar: 'bar' }))
      .to.be.equal('http://example.com/foo/bar')
  })

  it('the parse method will return a proper URL object', () => {
    const path = toRegexp(':foo/:bar')
    const url = parse('foo/bar', path)

    expect(url.pathname).to.be.equal('foo/bar')
    expect(url.hostname).to.be.equal(null)
    expect(url.params[0]).to.be.equal('foo')
    expect(url.params[1]).to.be.equal('bar')
  })

  it('the match method will return true only for the routes matching the test regex', () => {
    const path = toRegexp('http://example.com/:foo/:bar')

    expect(match('http://example.com/foo/bar', path)).to.be.ok
    expect(match('http://example.com/foo/bar/', path)).to.be.ok
    expect(match('http://example.com/foo', path)).to.be.not.ok
  })

  it('the streaming router gets exported', () => {
    expect(router).to.be.ok
  })

  it('the hash routes can be matched as well', (done) => {
    const fooBarStream = route('#:foo/:bar')

    fooBarStream.on.value(({params, hash}) => {
      expect(params[0]).to.be.equal('foo')
      expect(params[1]).to.be.equal('bar')
      expect(hash).to.be.equal('#foo/bar')

      fooBarStream.end()

      done()
    })

    router.push('#foo/bar')
  })

  it('a subroute stream gets properly created', done => {
    const fooBarStream = route(':foo/:bar')

    fooBarStream.on.value(({params}) => {
      expect(params[0]).to.be.equal('foo')
      expect(params[1]).to.be.equal('bar')

      fooBarStream.end()

      done()
    })

    router.push('foo/bar')
  })
})