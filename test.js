process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
}).on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown')
  process.exit(1)
})

process.on('warning', console.warn)

require('./tests/action.js')
require('./tests/actionContext.js')
require('./tests/application.js')
require('./tests/channel.js')
require('./tests/event.js')
require('./tests/eventQueue.js')
require('./tests/flow.js')
require('./tests/flowExamples.js')
require('./tests/milestone.js')
require('./tests/node.js')
require('./tests/request.js')
require('./tests/spider.js')
require('./tests/fuzz.js')
