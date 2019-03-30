import Channel from './channel'

const Action = require('./action')
const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')

class Node extends CommonClass {
  /**
   * [cosntructor description]
   * @param  {[type]} id      [description]
   * @param  {[type]} name    [description]
   * @param  {[type]} from    [description]
   * @param  {[type]} to      [description]
   * @param  {[type]} tags    [description]
   * @param  {[type]} actions [description]
   * @return {[type]}         [description]
   */
  constructor (application, id, name, to, tags, actions) {
    super()
    this.application = application
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        to: to || [],
        tags: tags || [],
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
      tags: this.tags,
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
      throw new Error(`Expected Node JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.name = result.name
    this.to = []

    for (var i = 0, len = result.to.length; i < len; i++) {
      if (result.to[i] instanceof Channel) {
        this.connect(result.to[i])
      } else {
        this.connect(new Channel(this.application).fromJSON(result.to[i]))
      }
    }

    this.tags = result.tags
    this.actions = []

    for (i = 0, len = result.actions.length; i < len; i++) {
      if (result.actions[i] instanceof Action) {
        this.actions.push(result.actions[i])
      } else {
        this.actions.push(new Action(this.application).fromJSON(result.actions[i]))
      }
    }

    this.log = new Log(this.id, 'Node', this.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

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
   * Connects a channel to the node
   * @return {[type]} [description]
   */
  connect (channel) {
    this.application.log.debug(`Connecting ${channel.name}:${channel.id} channel to ${this.name} name`)
    this.to.push(channel)
  }

  /**
   * Commits all accumulated actions within a request
   * @param  {[type]} event         [description]
   * @param  {[type]} actionContext [description]
   * @return {[type]}               [description]
   */
  async process (event, actionContext) {
    this.log.debug(`Processing node ${this.name}`)
    this.application.emit('Node', this, event.request)

    for (const action of this.actions) {
      this.log.debug(`Executing node action ${action.name}`)
      this.application.emit('Action', action, event.request)
      await action.execute(actionContext)
    }
  }
}

export { Node as default }
