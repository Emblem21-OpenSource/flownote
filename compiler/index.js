import Application from '../src/application'
import Semantics from './semantics'

const fs = require('fs')

class Compiler {
  /**
   * [constructor description]
   * @param  {[type]} grammarFilePath [description]
   * @param  {String} semanticsPath   [description]
   * @param  {[type]} application     [description]
   * @return {[type]}                 [description]
   */
  constructor (grammarFilePath = __dirname + '/default.ohm', semanticsPath = 'default', application, config, actions, name) {
    this.application = application

    if (this.application === undefined) {
      this.application = new Application(undefined, name, config || {}, undefined, undefined, actions, undefined, undefined, undefined)
    }
    this.actions = actions
    this.semanticsPath = semanticsPath
    this.grammarFilePath = grammarFilePath
  }

  /**
   * [loadSemantics description]
   * @return {[type]} [description]
   */
  async loadSemantics() {
    this.semantics = (await import(/* webpackInclude: /.+-semantics\.js$/ */ `./${this.semanticsPath}-semantics.js`)).default
    return this
  }

  /**
   * [compileFromFile description]
   * @param  {[type]} filename [description]
   * @return {[type]}          [description]
   */
  compileFromFile (filename) {
    this.filename = filename
    return this.compile(fs.readFileSync(this.filename, 'utf8'))
  }

  /**
   * [compile description]
   * @param  {[type]} contents [description]
   * @return {[type]}          [description]
   */
  compile (contents) {
    const semantics = new Semantics(this.semantics, this.grammarFilePath, this)
    const generator = semantics.getGenerator(this.application, this)
    const lines = contents.split('\n')

    lines.forEach(line => {
      const matches = semantics.getMatches(line)
      try {
        generator(matches).eval()
      } catch (e) {
        console.error(e)
        const errorPosition = parseInt(e.message.match(/match failed at position (\d+)/)[1])

        const barLength = matches.input.length > 80 ? 80 : matches.input.length
        const bar = new Array(barLength).join('=')
        throw new Error(`
Error in ${this.filename}:
${bar}
${matches.input}
${new Array(errorPosition).join(' ') + '^'}
${bar}`)
      }
    })

    return this.application
  }
}

export { Compiler as default }
