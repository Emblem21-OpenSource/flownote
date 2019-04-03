import Application from '../src/application'
import Semantics from './semantics'

const fs = require('fs')

class Compiler {
  constructor (filename, grammarFilePath, semanticsPath = 'default', application) {
    this.application = application

    if (this.application === undefined) {
      this.application = new Application(undefined, 'New App', {}, undefined, undefined, [
        // @TODO actions
      ], undefined, undefined, undefined)
    }

    this.semanticsPath = semanticsPath
    this.filename = filename
    this.grammarFilePath = grammarFilePath

    this.contents = fs.readFileSync(this.filename, 'utf8')
  }

  async compile () {
    this.semantics = (await import(/* webpackInclude: /.+-semantics\.js$/ */ `./${this.semanticsPath}-semantics.js`)).default
    const semantics = new Semantics(this.semantics, this.grammarFilePath)
    const generator = semantics.getGenerator(this.application)
    const lines = this.contents.split('\n')

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
${bar}
`)
      }
    })

    return this.application
  }
}

export { Compiler as default }
