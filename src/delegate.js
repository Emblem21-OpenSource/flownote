const cluster = require('cluster')
const numCPUs = require('os').cpus().length

class Delegate {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor () {
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
        cluster.workers[id].on('message', async function (worker, message) {
          const result = await workerListener(message) || {}
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
      data.event = event
      for (const id in cluster.workers) {
        cluster.workers[id].send(event, data)
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
        return false
      } else {
        data._id = this.getNextId()
        data._event = event
        worker.send(data)

        return new Promise((resolve, reject) => {
          this.delegates.set(data._id, {
            resolve,
            reject
          })
        })
      }
    }
    return false
  }

  /**
   * [onComplete description]
   * @param  {[type]} delegateId [description]
   * @param  {[type]} message    [description]
   * @param  {[type]} error      [description]
   * @return {[type]}            [description]
   */
  onComplete (delegateId, message, error) {
    if (cluster.isMaster) {
      const delegate = this.delegates.get(delegateId)
      delete message.delegateId

      if (error) {
        delegate.reject(message)
      } else {
        delegate.resolve(message)
      }
    }
  }
}

module.exports = Delegate
