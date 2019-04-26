const esm = require('esm')
require = esm(module)

const FlowNote = require('./src/index')
const fs = require('fs')

const serverType = (process.env.FLOWNOTE_SERVER_TYPE || 'stdin').toLowerCase()
const serverPort = parseInt(process.env.FLOWNOTE_SERVER_PORT) || 8080
const serverHost = process.env.FLOWNOTE_SERVER_HOST || '0.0.0.0'
const serverLogging = parseInt(process.env.FLOWNOTE_SERVER_LOGGING) || 2
const serverSilent = parseInt(process.env.FLOWNOTE_SERVER_SILENT)

if (!process.env.FLOWNOTE_JSON_FILE_PATH && !process.env.FLOWNOTE_APP_FILE_PATH) {
  throw new Error('No FlowNote --flow file or --json file designated.')
}

/**
 * [startApplication description]
 * @param  {[type]} application [description]
 * @return {[type]}             [description]
 */
function startApplication (application) {
  // Select Application Mode
  if (serverType === 'http') {
    // Listen for HTTP events
    const http = require('http')

    const httpServer = http.createServer(application.httpRequestHandler())
    httpServer.listen(serverPort, serverHost)
    application.log.write(`Waiting for incoming HTTP requests on http://${serverHost}:${serverPort} on the following endpoints:`)
    application.flows.forEach(flow => {
      application.log.write(`${flow.endpointMethod} ${flow.endpointRoute} {${flow.endpointParams.join(', ')}}`)
    })
  } else if (serverType === 'stdin') {
    // Listen for stdin events
    application.listen()
    application.log.write(`Waiting for incoming stdin requests`)
  } else {
    throw new Error('FLOWNOTE_SERVER_TYPE is unrecognized. Should be stdin or http')
  }
}

// Start

const appFilePath = process.env.FLOWNOTE_APP_FILE_PATH
const jsonFilePath = process.env.FLOWNOTE_JSON_FILE_PATH
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

if (jsonFilePath) {
  // Load from JSON file
  const appJson = fs.readFileSync(jsonFilePath).toString()
  const application = new FlowNote.Application().loadFlattened(appJson)
  startApplication(application)
} else {
  // Load from Flow file

  // Get FlowNote app details and load them
  const compiler = new FlowNote.Compiler(undefined, undefined, undefined, {
    logLevel: serverLogging,
    silent: serverSilent
  })

  compiler.loadSemantics().then(() => {
    const application = compiler.compileFromFile(appFilePath)
    startApplication(application)
  })
}
