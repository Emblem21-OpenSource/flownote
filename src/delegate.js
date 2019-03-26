const cluster = require('cluster')
const numCPUs = require('os').cpus().length

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
   * @param  {[type]} workerListener [description]
   * @return {[type]}                [description]
   */
  start (masterListener, workerListener) {
    if (cluster.isMaster) {
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

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

      for (const id in cluster.workers) {
        cluster.workers[id].on('message', function (message) {
          this.application.log.debug(`Worker listener...`)
          const result = workerListener(message) || {}
          result._id = message._id
          result._event = 'workerComplete'
          process.send(result)
        })
      }
    }
  }

  /**
   * [stop description]
   * @return {[type]} [description]
   */
  stop () {
    for (const id in cluster.workers) {
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
  sendAll (event, data) {
    if (cluster.isMaster) {
      this.application.log.debug(`Delegating ${event} to all workers...`)
      data._event = event
      for (const id in cluster.workers) {
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

      for (const id in cluster.workers) {
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
