const instances = new WeakMap()
const Log = require('./utils/log')
const Store = require('./store')

class ActionContext {
  /**
   * [constructor description]
   * @param  {[type]} application [description]
   * @param  {[type]} flow        [description]
   * @param  {[type]} step        [description]
   * @param  {[type]} request     [description]
   * @return {[type]}             [description]
   */
  constructor (application, flow, location, request) {
    instances.set(this, {
      application,
      flow,
      location,
      request
    })

    this.log = new Log(request.id, 'ActionContext', location.name, application.config.logLevel, application.outputPipe, application.errorPipe)
  }

  /**
   * [dispatch description]
   * @param  {[type]} eventName [description]
   * @return {[type]}           [description]
   */
  dispatch (eventName) {
    const { application, location, request, flow } = instances.get(this)
    application.dispatch(eventName, request, flow, location)
  }

  /**
   * [change description]
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  set (key, value) {
    const { application, flow, location, request } = instances.get(this)
    request.change(application, flow, location, key, value)
  }

  /**
   * [get description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  get (key, defaultValue) {
    const { request } = instances.get(this)
    var result = request.getState()[key]

    if (result === undefined) {
      return defaultValue
    } else {
      return request.getState()[key]
    }
  }

  /**
   * [fromStore description]
   * @param  {[type]} name [description]
   * @param  {[type]} key  [description]
   * @return {[type]}      [description]
   */
  fromStore (name, key) {
    return Store.get(name, key)
  }

  /**
   * [toStore description]
   * @param  {[type]} name  [description]
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  toStore (name, key, value) {
    Store.set(name, key, value)
  }

  /**
   * [schedule description]
   * @param  {[type]} action   [description]
   * @param  {[type]} strategy [description]
   * @return {[type]}          [description]
   */
  schedule (action, strategy) {
    const { request } = instances.get(this)
    request.addAction(action, strategy)
  }

  /**
   * [waitFor description]
   * @param  {[type]}   event    [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  async waitFor (stepId, callback) {
    const { application, request } = instances.get(this)
    this.log.debug('Registering waitFor...')

    // Check to see if the step has already been processed
    for (var step = 0, len = request.steps.length; step < len; step++) {
      if (request.steps[step].stepId === stepId) {
        this.log.debug('Resolving waitFor...')
        return callback(request)
      }
    }

    request.waiting = true
    return new Promise((resolve, reject) => {
      const listener = application.on('Node', async (source, resultRequest, error) => {
        this.log.debug(`Waiting for ${source.name}...`)
        if (error !== undefined) {
          request.waiting = false
          return reject(resultRequest)
        }

        if (resultRequest === request && source.id === stepId) {
          let result
          this.log.debug(`WaitFor ${source.name} complete.`)
          application.off(listener)
          if (callback) {
            result = await callback(resultRequest)
          }

          request.waiting = false
          resolve(result)
        }
      })
    })
  }
}

export { ActionContext as default }
