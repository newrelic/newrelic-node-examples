import newrelic from 'newrelic'

newrelic.instrument({ moduleName: 'normalize-url', isEsm: true, onRequire: function(shim, normalizeUrl, modName) {
  shim.wrap(normalizeUrl, 'default', function wrapNormalizeUrl(shim, orig) {
    return function wrappedNormalizeUrl() {
      // call original normalizeUrl function and get result
      const result = orig.apply(this, arguments)
      // append instrumented to the normalized url
      return `${result}/instrumented`
    }
  })
}})
