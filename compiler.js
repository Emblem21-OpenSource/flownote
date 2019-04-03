import Compiler from './compiler/index'

async function start () {
  const compiler = new Compiler('compiler/test.flow', 'compiler/default.ohm', 'default')
  const application = await compiler.compile('compiler/test.flow')
  console.log(application.asFlattened())
}

start()
