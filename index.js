process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
}).on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown')
  process.exit(1)
})

process.on('warning', console.warn)

require = require('esm')(module)

const FlowNote = require('./src/index')

module.exports = FlowNote
