import Compiler from './compiler'

async function start () {
  const compiler = new Compiler('grammar.ohm')
  const application = await compiler.compileFile('compiler/test.flow')
  console.log(application)
}

start()
