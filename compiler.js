import Compiler from './compiler/index'

async function start () {
  const compiler = new Compiler('compiler/test.flow', 'compiler/default.ohm', 'compiler/default-semantics.js')
  const application = compiler.compile('compiler/test.flow')
  console.log(application.asFlattened())
}

start()
