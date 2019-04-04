const CyclicalError = require('./errors/cyclicalError')

const noop = () => {}
const stacks = new WeakMap()
const Log = require('./utils/log')

/**
 *
 */
class Request {
  /**
   * [constructor description]
   * @param  {[type]} flow          [description]
   * @param  {[type]} onFlowSuccess [description]
   * @param  {[type]} onFlowFailure [description]
   * @return {[type]}               [description]
   */
  constructor (application, initialValue = {}, flow, step, options) {
    const entries = Object.entries(initialValue)

    this.application = application
    this.changes = []
    this.id = this.application.getUniqueId()

    for (const [key, value] of entries) {
      this.changes.push({
        appId: application.id,
        flowId: flow.id,
        stepId: step.id,
        key,
        value
      })
    }

    this.onCyclicWarning = noop
    this.onCyclicError = noop
    this.accumulatedActions = []
    this.steps = []
    this.stack = stacks.set(this, new Map())

    this.log = new Log(this.id, 'Request', this.application.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      id: this.id,
      changes: this.changes,
      accumulatedActions: this.accumulatedActions,
      steps: this.steps,
      state: this.getState()
    }
  }

  /**
   * Keeps track of what values have changed during the lifecycle of this request
   * @param  {[type]} application [description]
   * @param  {[type]} flow        [description]
   * @param  {[type]} step        [description]
   * @param  {[type]} key         [description]
   * @param  {[type]} value       [description]
   * @return {[type]}             [description]
   */
  change (application, flow, step, key, value) {
    this.changes.push({
      appId: application.id,
      flowId: flow.id,
      stepId: step.id,
      key,
      value
    })
    this.application.emit('ValueChange', { [key]: value }, this)
    return this
  }

  /**
   * [change description]
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  thenChange (key, value, stepId) {
    const lastChange = this.changes[this.changes.length - 1]

    this.changes.push({
      appId: lastChange.appId,
      flowId: lastChange.flowId,
      stepId: stepId || lastChange.stepId,
      key: key,
      value
    })
    this.application.emit('ValueChange', { [key]: value }, this)
    return this
  }

  /**
   * Returns the current value map of the request
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  getState (data) {
    const result = {}
    const entries = Object.entries(data || {})

    for (var [key, value] of entries) {
      result[key] = value
    }

    for (var i = 0, len = this.changes.length; i < len; i++) {
      result[this.changes[i].key] = this.changes[i].value
    }

    return result
  }

  /**
   * [addStep description]
   * @param {[type]} application [description]
   * @param {[type]} flow        [description]
   * @param {[type]} step        [description]
   */
  addStep (application, flow, step) {
    const stack = stacks.get(this)
    const value = stack.get(step.id) || 1

    if (value > 100) {
      throw new CyclicalError()
    }

    stack.set(step.id, value + 1)

    this.steps.push({
      appId: application.id,
      flowId: flow.id,
      stepId: step.id
    })
  }

  /**
   * [addAction description]
   * @param {[type]} action [description]
   */
  addAction (action) {
    this.accumulatedActions.push(action)
    return this
  }

  /**
   * [rollbackChanges description]
   * @param  {[type]} stepId [description]
   * @return {[type]}        [description]
   */
  rollbackChanges (stepId) {
    const len = this.changes.length - 1
    let lastIndex

    for (var i = len; i >= 0; i--) {
      if (this.changes[i].stepId === stepId) {
        lastIndex = i
      }
    }

    if (lastIndex !== undefined) {
      this.changes = this.changes.slice(0, lastIndex)
    }
  }
}

module.exports = Request
