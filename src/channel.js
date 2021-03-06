import Node from './node'
import Spider from './spider'
import Action from './action'

const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')

class Channel extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} id      [description]
   * @param  {[type]} name    [description]
   * @param  {[type]} from    [description]
   * @param  {[type]} to      [description]
   * @param  {[type]} accepts [description]
   * @param  {[type]} retry   [description]
   * @param  {[type]} actions [description]
   * @return {[type]}         [description]
   */
  constructor (application, id, name, to, accepts, retry, retryDelay, actions) {
    super()
    this.application = application
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        to: to || undefined,
        accepts: accepts || [],
        retry: retry || undefined,
        retryDelay: retryDelay || 0,
        actions: actions || []
      })
    }
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      to: this.to,
      accepts: this.accepts,
      retry: this.retry,
      retryDelay: this.retryDelay,
      actions: this.actions
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
      throw new Error(`Expected Channel JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.name = result.name

    if (result.to instanceof Node) {
      this.connect(result.to)
    } else if (result.to !== undefined && !this.application.isPendingStep(result.to.id)) {
      let existingNode

      this.application.setPendingStep(result.to.id)

      if (this.application !== undefined) {
        existingNode = new Spider().search(this.application, result.to.id)
      }

      if (existingNode) {
        this.connect(existingNode)
      } else {
        this.connect(new Node(this.application).fromJSON(result.to))
      }
      this.application.removePendingStep(result.to.id)
    }

    this.retry = result.retry
    this.retryDelay = result.retryDelay

    this.accepts = []
    this.actions = []

    for (var i = 0, len = result.accepts.length; i < len; i++) {
      this.accepts.push(result.accepts[i])
    }

    for (i = 0, len = result.actions.length; i < len; i++) {
      if (result.actions[i] instanceof Action) {
        this.actions.push(result.actions[i])
      } else {
        this.actions.push(new Action(undefined, undefined, this.application).fromJSON(result.actions[i]))
      }
    }

    this.log = new Log(this.id, 'Channel', this.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

    return this
  }

  /**
   * [addAction description]
   * @param {[type]} name [description]
   */
  addAction (nameOrAction) {
    if (nameOrAction instanceof Action) {
      this.actions.push(nameOrAction)
    } else {
      const action = this.application.getAction(nameOrAction)
      if (action) {
        this.actions.push(action)
      } else {
        throw RangeError(`Could not find the ${action} action`)
      }
    }
  }

  /**
   * Connects a node or milestone to the channel
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  connect (node) {
    this.application.log.debug(`Connecting node ${node.name}:${node.id} to ${this.name} channel`)
    this.to = node
  }

  /**
   * Commits all accumulated actions within a request
   * @param  {[type]} event         [description]
   * @param  {[type]} actionContext [description]
   * @return {[type]}               [description]
   */
  async process (event, actionContext) {
    this.log.debug('Processing channel')
    this.application.emit('Channel', this, event.request)

    for (const action of this.actions) {
      this.log.debug(`Executing channel action ${action.name}`)
      this.application.emit('Action', action, event.request)
      await action.execute(actionContext)
    }
  }
}

export { Channel as default }
