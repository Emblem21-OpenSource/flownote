const vm = require('vm')

/**
 * [exports description]
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 */
module.exports = function executeCode (code) {
  if (code instanceof Function) {
    return code
  } else if (typeof code === 'string') {
    return vm.compileFunction(`return ${code}`, [], {
      parsingContext: vm.createContext({}, {
        codeGeneration: {
          strings: true
        }
      })
    })()
  } else {
    throw new TypeError(`Code needs to be a function or string, not ${code}`)
  }
}
