const colors = require('colors')
const util = require('util')

const LOG_LEVEL = {
  error: 1,
  warning: 2,
  info: 3,
  debug: 4
}

/**
 * [description]
 * @param  {[type]} id   [description]
 * @param  {[type]} type [description]
 * @param  {[type]} name [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const getLog = (id, type, name, data) => {
  const header = colors.gray.dim('<') + 
    colors.yellow(new Date().toISOString()) +
    colors.gray('>') +
    ' ' + 
    colors.cyan(type) +
    colors.white('.') +
    colors.magenta(name) +
    ' ' + 
    colors.gray('[') + 
    colors.blue(id) +
    colors.gray(']') +
    colors.green(' ')

  const body = util.inspect(data, {
    depth: 5,
    colors: true,
    sorted: true
  })
  return header + body
}

class Log {
  constructor (contextId, contextType, contextName, logLevel, outputPipe, errorPipe) {

    this.contextId = contextId
    this.contextName = contextName
    this.contextType = contextType
    this.logLevel = logLevel
    this.outputPipe = outputPipe
    this.errorPipe = errorPipe
  }

  /**
   * [warn description]
   * @param  {...[type]} data [description]
   * @return {[type]}         [description]
   */
  warn (data) {
    if (this.logLevel >= LOG_LEVEL.warn) {
      this.outputPipe.write(getLog(this.contextId, this.contextType, this.contextName, data) + '\n')
    }
  }

  /**
   * [info description]
   * @param  {...[type]} data [description]
   * @return {[type]}         [description]
   */
  info (data) {
    if (this.logLevel >= LOG_LEVEL.info) {
      this.outputPipe.write(getLog(this.contextId, this.contextType, this.contextName, data) + '\n')
    }
  }

  /**
   * [debug description]
   * @param  {...[type]} data [description]
   * @return {[type]}         [description]
   */
  debug (data) {
    if (this.logLevel >= LOG_LEVEL.debug) {
      this.outputPipe.write(getLog(this.contextId, this.contextType, this.contextName, data) + '\n')
    }
  }

  /**
   * [error description]
   * @param  {...[type]} data [description]
   * @return {[type]}         [description]
   */
  error (data) {
    if (this.logLevel >= LOG_LEVEL.error) {
      this.errorPipe.write(getLog(this.contextId, this.contextType, this.contextName, data) + '\n')
    }
  }
}

module.exports = Log