const cluster = require('cluster')
const numCPUs = 1 || require('os').cpus().length

class Delegate {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor (application) {
    this.application = application
    this.nextId = 0
    this.nextWorker = 0
    this.delegates = new Map()
  }

  /**
   * [start description]
   * @param  {[type]} masterListener [description]
   * @return {[type]}                [description]
   */
  startMaster (masterListener) {
    if (cluster.isMaster) {
      cluster.on('message', async (worker, message) => {
        const delegate = this.delegates.get(message._id)

        try {
          this.application.log.debug(`Master listener...`)
          const result = await masterListener(message)
          if (message._event === 'workerComplete') {
            this.delegates.delete(message._id)
            delegate.resolve(result)
          }
        } catch (error) {
          if (message._event === 'workerComplete') {
            this.delegates.delete(message._id)
            delegate.reject(error)
          }
        }
      })

      cluster.setupMaster({
        silent: true
      })

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }
    }
  }

  /**
   * [startWorker description]
   * @param  {[type]} workerListener [description]
   * @return {[type]}                [description]
   */
  startWorker (workerListener) {
    this.outputPipe.write('Starting worker')
    process.on('message', async function (message) {
      this.outputPipe.write('wack2')
      this.application.log.debug(`Worker listener...`)
      const result = await workerListener(message) || {}
      result._id = message._id
      result._event = 'workerComplete'
      process.send(result)
    })
    // worker.process.stdout.pipe(this.application.outputPipe)
    // worker.process.stderr.pipe(this.application.errorPipe)
  }

  /**
   * [stop description]
   * @return {[type]} [description]
   */
  stopMaster () {
    for (var id = 0, len = cluster.workers.length; id < len; id++) {
      cluster.workers[id].kill()
    }
  }

  /**
   * [getNextId description]
   * @return {[type]} [description]
   */
  getNextId () {
    const result = this.nextId
    this.nextId += 1
    return result
  }

  /**
   * [sendAll description]
   * @param  {[type]} event [description]
   * @param  {[type]} data  [description]
   * @return {[type]}       [description]
   */
  async sendAll (event, data) {
    if (cluster.isMaster) {
      this.application.log.debug(`Delegating ${event} to all workers...`)
      data._event = event
      for (var id = 0, len = cluster.workers.length; id < len; id++) {
        cluster.workers[id].send(data)
      }
    }
  }

  /**
   * [send description]
   * @param  {[type]} event [description]
   * @param  {[type]} data  [description]
   * @return {[type]}       [description]
   */
  send (event, data) {
    if (cluster.isMaster) {
      var i = 0
      let worker

      for (var id = 0, len = cluster.workers.length; id < len; id++) {
        if (i === this.nextWorker) {
          worker = cluster.workers[id]
          break
        }
        i += 1
      }

      this.nextWorker = (this.nextWorker + 1) % (numCPUs + 1)

      if (worker === undefined) {
        this.application.log.debug(`Master process is to be used.`)
        return false
      } else {
        this.application.log.debug(`Process ${worker.id} is to be used.`)
        data._id = this.getNextId()
        data._event = event

        return new Promise((resolve, reject) => {
          this.delegates.set(data._id, {
            resolve,
            reject
          })
          worker.send(data)
          this.application.log.debug(`Delegation underway for ${event}...`)
        })
      }
    }
    return false
  }
}

module.exports = Delegate
