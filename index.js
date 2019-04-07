require = require('esm')(module)

const fs = require('fs')
const http = require('http')
const FlowNote = require('./src/index')

const serverType = (process.env.FLOWNOTE_SERVER_TYPE || 'stdin').toLowerCase()
const appFilePath = (process.env.FLOWNOTE_APP_FILE_PATH || new Error('No FlowNote file designated.')).toLowerCase()

if (require.main === module) {
	// Index called via CLI
	process.on('unhandledRejection', (reason, p) => {
	  console.error(reason, 'Unhandled Rejection at Promise', p)
	  process.exit(1)
	}).on('uncaughtException', err => {
	  console.error(err, 'Uncaught Exception thrown')
	  process.exit(1)
	})

	process.on('warning', console.warn)

	if (serverTye === 'http') {

	} else {
		
	}
} else {
	// Index called via module require
	module.exports = FlowNote
}
