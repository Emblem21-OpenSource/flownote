import Node from './node'
import Channel from './channel'
import Spider from './spider'
import Milestone from './milestone'
import Flow from './flow'

const Request = require('./request')
const CommonClass = require('./utils/commonClass')

class Event extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} id      [description]
   * @param  {[type]} request [description]
   * @param  {[type]} from    [description]
   * @param  {[type]} to      [description]
   * @return {[type]}         [description]
   */
  constructor (application, id, type, request, from, flow, retries, error) {
    super()
    this.application = application
    if (type !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        request: request || undefined,
        from: from || undefined,
        flow: flow || undefined,
        type: type || 'event',
        retries: retries || 0,
        error: error || undefined
      })
    }
  }

  /**
   * [attachRequest description]
   * @param  {[type]} request [description]
   * @return {[type]}         [description]
   */
  attachRequest (request) {
    this.request = request
  }

  /**
   * [setError description]
   * @param {[type]} error [description]
   */
  setError (error) {
    this.error = error.toString()
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      id: this.id,
      request: this.request,
      from: this.from.id,
      type: this.type,
      flow: this.flow.id,
      retries: this.retries
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
      throw new Error(`Expected Event JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.type = result.type
    this.error = result.error

    if (result.request instanceof Request) {
      this.request = result.request
    } else if (result.request !== undefined) {
      this.request = new Request().fromJSON(result.request)
    }

    if (result.from instanceof Node || result.from instanceof Milestone || result.from instanceof Channel || result.from instanceof Flow) {
      this.from = result.from
    } else if (result.from !== undefined) {
      const existingNode = new Spider().search(this.application, result.from) // result.from will be an id
      // The node/channel/milestone/flow will exist at the time the event is rehydrated
      this.from = existingNode
    }

    if (result.flow instanceof Flow) {
      this.flow = result.from
    } else if (result.from !== undefined) {
      const existingFlow = new Spider().search(this.application, result.flow) // result.flow will be an id
      // The flow will exist at the time the event is rehydrated
      this.flow = existingFlow
    }

    this.retries = result.retries

    return this
  }
}

export { Event as default }
