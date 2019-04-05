import Queue from '../queue'

const applicationQueues = new WeakMap()

class MemoryQueue extends Queue {
  constructor (application, pendingEvents) {
    super(application, 'memory')
    if (pendingEvents !== undefined) {
      this.fromJSON({
        pendingEvents: pendingEvents || []
      })
    }
  }

  /**
   * [push description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  push (event) {
    applicationQueues.get(this.application).push(event)
  }

  /**
   * [pop description]
   * @return {[type]} [description]
   */
  pop () {
    return applicationQueues.get(this.application).shift()
  }

  /**
   * [isEmpty description]
   * @return {Boolean} [description]
   */
  count () {
    return applicationQueues.get(this.application).length
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      type: this.type,
      pendingEvents: applicationQueues.get(this.application).entries()
    }
  }

  /**
   * [fromJSON description]
   * @param  {[type]} json [description]
   * @return {[type]}      [description]
   */
  fromJSON (json) {
    let result

    if (typeof json === 'string') {
      result = this.loadFlattened(json)
    } else if (json instanceof Object && !(json instanceof Array)) {
      result = json
    } else {
      throw new Error(`Expected MemoryQueue JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    applicationQueues.set(this.application, result.pendingEvents)

    return this
  }
}

export { MemoryQueue as default }
