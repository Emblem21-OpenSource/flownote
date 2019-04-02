import Compiler from './compiler/index'

async function start () {
  console.log(1)
  const compiler = new Compiler('grammar.ohm')
  console.log(2)
  const application = await compiler.compileFile('compiler/test.flow')
  console.log(3)
  console.log(application)
}

start()
