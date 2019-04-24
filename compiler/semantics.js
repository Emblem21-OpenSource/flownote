const ohm = require('ohm-js')
const fs = require('fs')

class Semantics {
  /**
   * [constructor description]
   * @return {[type]}                 [description]
   */
  constructor (semantics, grammarFilePath, compiler) {
    this.semantics = semantics
    this.grammer = undefined
    this.filename = grammarFilePath
    this.grammar = ohm.grammar(fs.readFileSync(this.filename, 'utf8'))
    this.compiler = compiler
  }

  /**
   * Returns if the grammar file has been properly loaded
   */
  isGrammarLoaded () {
    return this.grammar !== undefined
  }

  /**
   * Determines if the content is valid FlowNote grammar
   */
  isValid (content) {
    if (this.isGrammarLoaded()) {
      const match = this.grammar.match(content)
      return match.succeeded()
    }
  }

  /**
   * Returns the Ohm grammar trace of a string.
   */
  trace (content) {
    if (this.isGrammarLoaded()) {
      return this.grammar.trace(content)
    }
  }

  /**
   * [getGenerator description]
   * @param  {[type]} application [description]
   * @return {[type]}             [description]
   */
  getGenerator (application, compiler, namespace) {
    return this.grammar.createSemantics().addOperation('eval', this.semantics(application, this.compiler, namespace))
  }

  /**
   * [getMatches description]
   * @param  {[type]} content [description]
   * @return {[type]}         [description]
   */
  getMatches (content) {
    return this.grammar.match(content)
  }
}

export { Semantics as default }
