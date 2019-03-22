const instances = new WeakMap()

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
  get (key) {
    const { request } = instances.get(this)
    return request.getState()[key]
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
    application.logDebug('Registering waitFor...')

    // Check to see if the step has already been processed
    for (const step in request.steps) {
      if (request.steps[step].stepId === stepId) {
        application.logDebug('Resolving waitFor...')
        return callback(request)
      }
    }

    return new Promise((resolve, reject) => {
      const listener = application.on('Node', async (source, resultRequest, error) => {
        application.logDebug(`Waiting for ${source.name}...`)
        if (error !== undefined) {
          return reject(resultRequest)
        }

        if (resultRequest === request && source.id === stepId) {
          let result
          application.logDebug(`WaitFor ${source.name} complete.`)
          application.off(listener)
          if (callback) {
            result = await callback(resultRequest)
          }
          resolve(result)
        }
      })
    })
  }
}

export { ActionContext as default }
