import Application from '../src/application'
import Semantics from './semantics'

const fs = require('fs')

class Compiler {
  constructor (filename, grammarFilePath, semanticsPath, application) {
    this.application = application

    if (this.application === undefined) {
      this.application = new Application(undefined, 'New App', {}, undefined, undefined, [ /* actions */ ], undefined, undefined, undefined)
    }

    this.semantics = require(`../${semanticsPath}`)
    this.filename = filename
    this.grammarFilePath = grammarFilePath

    this.contents = fs.readFileSync(this.filename, 'utf8')
  }

  /**
   * Returns a valid FlowNote structure
   * @param  {String} content
   * @return {Flow}
   */
  async compile () {
    const semantics = new Semantics(this.semantics)
    await semantics.loadGrammar(this.grammarFilePath)
    const generator = semantics.getGenerator(this.application)
    const lines = this.contents.split('\n')

    lines.forEach(line => {
      const matches = semantics.getMatches(line)

      try {
        generator(matches).eval()
      } catch (e) {
        const errorPosition = parseInt(e.message.match(/match failed at position (\d+)/)[1])
        let totalCharacters = 0
        for (var index = 0, len = lines.length; index < len; index++) {
          const range = lines[index].length

          if (totalCharacters + range >= errorPosition) {
            let caratPosition = 0

            if (totalCharacters >= errorPosition) {
              caratPosition = totalCharacters - errorPosition
            } else {
              caratPosition = errorPosition - totalCharacters
            }

            const bar = lines[index].length > 50 ? 50 : new Array(lines[index].length).join('=')
            console.error()
            console.error(`Error on Line ${index + 1} of ${this.filename}:`)
            console.error(bar)
            console.error(lines[index])
            console.error(new Array(caratPosition).join(' ') + '^')
            console.error(bar)
            console.error()
            console.error(`Error: ${e.stack}`)
            console.error()
            break
          }

          totalCharacters += range + 1
        }
      }
    })

    return this.application
  }
}

export { Compiler as default }
