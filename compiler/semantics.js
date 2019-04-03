const ohm = require('ohm-js')
const fs = require('fs')

class Semantics {
  /**
   * [constructor description]
   * @return {[type]}                 [description]
   */
  constructor (semantics) {
    this.semantics = semantics
    this.grammer = undefined
  }

  /**
   * Loads a grammar file into the Semantics
   */
  async loadGrammar (grammarFilePath) {
    if (!this.isGrammarLoaded()) {
      return new Promise((resolve, reject) => {
        fs.readFile(grammarFilePath, 'utf8', (err, contents) => {
          if (err) {
            reject(err)
          } else {
            this.grammar = ohm.grammar(contents)
            resolve(contents)
          }
        })
      })
    }
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
  getGenerator (application) {
    return this.grammar.createSemantics().addOperation('eval', this.semantics(application))
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
