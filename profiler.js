require = require('esm')(module)
const profiler = require('./src/utils/profiler')
profiler.listen(3000, 'localhost')

import Compiler from './compiler/index'
const getStdin = require('get-stdin')

const [,, ...args] = process.argv
const languageIndex = args.indexOf('-l')

let language

if (languageIndex === -1) {
  language = 'default'
} else {
  language = args[languageIndex + 1]
}

async function start () {
  const compiler = new Compiler(`compiler/${language}.ohm`, language)
  const filepath = args[args.length - 1]

  let application

  if (!filepath) {
    // Using stdin for file contents
    const contents = await getStdin()
    application = await compiler.compile(contents)
  } else {
    // Using filename for contents

    application = await compiler.compileFromFile(filepath)
  }

  process.stdout.write(application.asFlattened())
}

start()
