const esm = require('esm')
require = esm(module)

const FlowNote = require('./src/index')

if (require.main === module) {
  // Index called via CLI

  const serverType = (process.env.FLOWNOTE_SERVER_TYPE || 'stdin').toLowerCase()
  const serverPort = parseInt(process.env.FLOWNOTE_SERVER_PORT) || 8080
  const serverHost = process.env.FLOWNOTE_SERVER_HOST || '0.0.0.0'
  const serverLogging = parseInt(process.env.FLOWNOTE_SERVER_LOGGING) || 2
  const serverSilent = parseInt(process.env.FLOWNOTE_SERVER_SILENT)

  if (!process.env.FLOWNOTE_APP_FILE_PATH) {
    throw new Error('No FlowNote file designated.')
  }

  if (!process.env.FLOWNOTE_ACTIONS_FILE_PATH) {
    throw new Error('No FlowNote actions module designated.')
  }

  const appFilePath = process.env.FLOWNOTE_APP_FILE_PATH.toLowerCase()
  const actionsFilePath = process.env.FLOWNOTE_ACTIONS_FILE_PATH
  // @TODO Allow application name to be passed in

  // Establish exception handling
  process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
    process.exit(1)
  }).on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
    process.exit(1)
  })
  process.on('warning', console.warn)

  let actions = require(`./${actionsFilePath}`)
  if (actions.default) {
    actions = actions.default
  }

  // Get FlowNote app details and load them
  const compiler = new FlowNote.Compiler(undefined, undefined, undefined, {
    logLevel: serverLogging,
    silent: serverSilent
  }, actions || [])

  compiler.compileFromFile(appFilePath).then(application => {
    // Application compiled

    // Select Application Mode
    if (serverType === 'http') {
      // Listen for HTTP events
      const http = require('http')

      const httpServer = http.createServer(application.httpRequestHandler())
      httpServer.listen(serverPort, serverHost)
      application.log.info(`Waiting for incoming HTTP requests on http://${serverHost}:${serverPort} on the following endpoints:`)
      application.flows.forEach(flow => {
        application.log.info(`${flow.endpointMethod} ${flow.endpointRoute} {${flow.endpointParams.join(', ')}}`)
      })
    } else if (serverType === 'stdin') {
      // Listen for stdin events
      application.listen()
      application.log.info(`Waiting for incoming stdin requests`)
    } else {
      throw new Error('FLOWNOTE_SERVER_TYPE is unrecognized. Should be stdin or http')
    }
  })
} else {
  // Index called via module require
  module.exports = FlowNote
}
