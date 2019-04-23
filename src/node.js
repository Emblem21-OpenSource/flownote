import Channel from './channel'
import StandardChannel from './channels/standardChannel'
import Milestone from './milestone'
import Action from './action'

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
  constructor (application, id, name, to, tags, actions, config) {
    super()
    this.application = application
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        to: to || [],
        tags: tags || [],
        actions: actions || [],
        config: Object.assign({
          silent: false
        }, config || {})
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
      actions: this.actions,
      config: this.config
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
    this.config = result.config

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
        this.actions.push(new Action(undefined, undefined, this.application).fromJSON(result.actions[i]))
      }
    }

    this.log = new Log(this.id, 'Node', this.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

    return this
  }

  /**
   * [addAction description]
   * @param {[type]} name [description]
   */
  addAction (nameOrAction, spliceIndex) {
    if (nameOrAction instanceof Action) {
      if (spliceIndex !== undefined) {
        this.actions.splice(spliceIndex, 0, nameOrAction)
      } else {
        this.actions.push(nameOrAction)
      }
    } else {
      const action = this.application.getAction(nameOrAction)
      if (action) {
        if (spliceIndex !== undefined) {
          this.actions.splice(spliceIndex, 0, action)
        } else {
          this.actions.push(action)
        }
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

    this.application.emit('Node', this, event.request, undefined, this.config.silent)

    for (const action of this.actions) {
      this.log.debug(`Executing node action ${action.name}`)
      this.application.emit('Action', action, event.request, undefined, this.config.silent)
      await action.execute(actionContext)
    }
  }

  /**
   * [hasMilestone description]
   * @return {Boolean} [description]
   */
  hasMilestone () {
    for (var i = 0, len = this.to.length; i < len; i++) {
      if (this.to[i] instanceof StandardChannel && this.top[i].to instanceof Milestone) {
        return this.top[i].to
      }
    }
    return false
  }
}

export { Node as default }
