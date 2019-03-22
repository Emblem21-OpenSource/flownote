import Channel from './channel'

const Action = require('./action')
const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')

class Milestone extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} id       [description]
   * @param  {[type]} name     [description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} from     [description]
   * @param  {[type]} to       [description]
   * @return {[type]}          [description]
   */
  constructor (application, flow, id, name, strategy, to, actions) {
    super()
    this.application = application
    this.flow = flow
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        strategy: strategy || 'fcfs', //   First come, first serve; Wait for all; Custom priority
        to: to || [],
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
      strategy: this.strategy,
      to: this.to,
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
      throw new Error(`Expected Milestone JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.name = result.name
    this.strategy = result.strategy
    this.to = []

    for (var i = 0, len = result.to.length; i < len; i++) {
      if (result.to[i] instanceof Channel) {
        this.connect(result.to[i])
      } else {
        this.connect(new Channel(this.application).fromJSON(result.to[i]))
      }
    }

    this.actions = []

    for (i = 0, len = result.actions.length; i < len; i++) {
      if (result.actions[i] instanceof Action) {
        this.addAction(result.actions[i])
      } else {
        this.addAction(new Action(this.application).fromJSON(result.actions[i]))
      }
    }

    this.requestIdHistory = []

    this.log = new Log(this.id, 'Milestone', this.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

    return this
  }

  /**
   * Connects a outbound channel to the milestone
   * @param  {[type]} channel [description]
   * @return {[type]}         [description]
   */
  connect (channel) {
    this.to.push(channel)
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
   * Commits all accumulated actions within a request
   * @param  {[type]} event         [description]
   * @param  {[type]} actionContext [description]
   * @return {[type]}               [description]
   */
  async process (event, actionContext) {
    this.log.debug(`Processing Milestone`)
    this.application.emit('Milestone.start', this, event.request)
    for (const action of this.actions) {
      this.log.debug(`Executing Milestone action ${action.name}`)
      this.application.emit('Action', action, event.request)
      await action.execute(actionContext)
    }

    for (const accumulatedAction of event.request.accumulatedActions) {
      this.log.debug(`Executing Accumulated action ${action.name}`)
      this.application.emit('Action', accumulatedAction, event.request)
      await accumulatedAction.execute(actionContext)
    }

    this.application.emit('Milestone.end', this, event.request)

    if (this.to === undefined) {
      // The Flow has ended
      this.application.emit('Flow.end', this.flow, event.request)
    } else {
      // this.application.dispatch(Channel)
    }
  }
}

export { Milestone as default }
