import Application from '../application'
import Semantics from './semantics'

const fs = require('fs')

class Compiler {
  constructor (grammarFilePath, application) {
    this.application = application

    if (this.application === undefined) {
      this.application = new Application(undefined, 'New App', {}, undefined, undefined, [ /* actions */ ], undefined, undefined, undefined)
    }

    this.grammarFilePath = grammarFilePath
  }

  /**
   * Loads a grammar file into the Semantics
   */
  async loadContent (filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf8', (err, contents) => {
        if (err) {
          reject(err)
        } else {
          resolve(contents)
        }
      })
    })
  }

  /**
   * [compileFile description]
   * @param  {[type]} filename [description]
   * @return {[type]}          [description]
   */
  async compileFile (filename) {
    const content = await this.loadContent(filename)
    return this.compile(content)
  }

  /**
   * Returns a valid FlowNote structure
   * @param  {String} content
   * @return {Flow}
   */
  async compile (content) {
    const semantics = new Semantics()
    await semantics.loadGrammar(this.grammarFilePath)
    const generator = semantics.getGenerator(this.application)
    const lines = content.split('\n')

    lines.forEach(line => {
      semantics.getMatches(content)
    })

    const matches = semantics.getMatches(content)
    generator(matches).eval()
    return this.application
  }
}

export { Compiler as default }
