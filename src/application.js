import Flow from './flow'
import Event from './event'

const querystring = require('querystring')
const IdGenerator = require('./utils/IdGenerator')
const EventQueue = require('./eventQueue')
const Action = require('./action')
// const Delegate = require('./delegate')
const Request = require('./request')
const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')
const stringify = require('fast-safe-stringify')

const noop = () => {}

class Application extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} id         [description]
   * @param  {[type]} name       [description]
   * @param  {[type]} config     [description]
   * @param  {[type]} publicFlow [description]
   * @param  {[type]} flows      [description]
   * @return {[type]}            [description]
   */
  constructor (id, name, config, publicFlow, flows, actions, inputPipe, outputPipe, errorPipe) {
    super()

    this.inputPipe = inputPipe || process.stdin
    this.outputPipe = outputPipe || process.stdout
    this.errorPipe = errorPipe || process.stderr

    this.fromJSON({
      id: id || IdGenerator()(),
      name: name || 'Unnamed',
      config: Object.assign({
        logLevel: 2,
        silent: true
      }, config || {}),
      publicFlow: publicFlow || undefined,
      flows: flows || [],
      actions: actions || new Map()
    })

    this.log.info('FlowNote running...')
  }

  /**
   * [onHttpRequest description]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  async httpRequestHandler (req, res) {
    const parts = req.url.split('?')
    const result = await this.request(req.method, parts[0], parts[1])
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(JSON.stringify(result))
  }

  /**
   * [listen description]
   * @return {[type]} [description]
   */
  async listen () {
    this.log.debug('Listening')
    this.log.debug(this.listening)
    // Prepare Readable stream handling for the inputPipe
    if (!this.listening) {
      // Master
      this.inputPipe.setEncoding('utf8')

      this.inputPipe.on('readable', () => {
        // Gather a chunk of input
        let chunk
        while ((chunk = this.inputPipe.read()) !== null) {
          this.onInput(chunk)
        }
      })

      // Register the StdIn end callback
      this.inputPipe.on('end', this.onShutdown)

      this.listening = true
      /*
      if (cluster.isMaster) {
        this.log.debug(`Starting workers...`)

        const delegatePromise = new Promise(resolve => {
          let completed = 0
          cluster.on('online', (worker) => {
            this.log.debug(`Worker ${worker.id} ready`)
            completed += 1
            if (completed === numCPUs) {
              resolve()
            }
          })

          this.delegate.startMaster(function masterHandler (message) {
            switch (message._event) {}
          })
        })

        delegatePromise.then(() => {
          this.listening = true
          this.log.debug(`Application ready`)
        })

        return delegatePromise
      } else {
        // Worker
        this.outputPipe.write('Worker listen')
        this.delegate.startWorker(async message => {
          switch (message._event) {
            case 'executeAction':
              this.application.debug('Got message', message)
              return this.executeAction(message.method, message.path, message.params)
          }
        })
        this.listening = true
      }
      */
    }
  }

  /**
   * [unlisten description]
   * @return {[type]} [description]
   */
  unlisten () {
    if (this.listening) {
      this.log.debug(`Application no longer listening...`)
      this.inputPipe.removeAllListeners()
      // this.log.debug(`Stopping application delegators...`)
      // this.delegate.stopMaster()

      this.listening = false
    }
  }

  /**
   * [onEvent description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  setOnEvent (callback) {
    this.onEvent = callback || noop
  }

  /**
   * [setOnInput description]
   * @param {Function} callback [description]
   */
  setOnInput (callback) {
    this.onInput = callback || noop
  }

  /**
   * [setOnInput description]
   * @param {Function} callback [description]
   */
  setOnShutdown (callback) {
    this.onShutdown = callback || noop
  }

  /**
   * [getConfig description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getConfig (key) {
    return this.config[key]
  }

  /**
   * [setConfig description]
   * @param {[type]} key   [description]
   * @param {[type]} value [description]
   */
  setConfig (key, value) {
    this.config[key] = value
    return this.config[key]
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    const actions = []

    for (var [key, action] of this.actions.entries()) {
      actions.push([
        key,
        action
      ])
    }

    return {
      id: this.id,
      name: this.name,
      config: this.config,
      publicFlow: this.publicFlow,
      flows: this.flows,
      actions,
      eventQueue: this.eventQueue
    }
  }

  /**
   * [fromJSON description]
   * @param  {[type]} flattened [description]
   * @return {[type]}      [description]
   */
  fromJSON (flattened) {
    let result

    if (typeof flattened === 'string') {
      result = this.loadFlattened(flattened)
    } else if (flattened instanceof Object && !(flattened instanceof Array)) {
      result = flattened
    } else {
      throw new Error(`Expected Application JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    if (result.flows.length === 0 && result.publicFlow) {
      result.flows.push(result.publicFlow)
    }

    this.id = result.id
    this.name = result.name
    this.config = result.config
    this.flows = []
    this.actions = new Map()
    this.activeRequests = new Map()
    this.eventQueue = new EventQueue(this, result.eventQueue || [])
    this.listeners = []
    this.onEvent = noop
    this.onInput = noop
    this.onShutdown = noop
    this.listening = false
    this.nextWorker = 0
    // this.delegate = new Delegate(this)

    if (result.publicFlow instanceof Flow) {
      this.publicFlow = result.publicFlow
      result.publicFlow.application = this
    } else if (result.publicFlow instanceof Object) {
      this.publicFlow = new Flow(this).fromJSON(result.publicFlow)
    }

    for (var i = 0, len = result.flows.length; i < len; i++) {
      if (result.flows[i] instanceof Flow) {
        result.flows[i].application = this
        this.registerFlow(result.flows[i])
      } else if (result.flows[i] instanceof Object) {
        this.registerFlow(new Flow(this).fromJSON(result.flows[i]))
      }
    }

    for (i = 0, len = result.actions.length; i < len; i++) {
      if (result.actions[i] instanceof Action) {
        result.actions[i].application = this
        this.registerAction(result.actions[i].name, result.actions[i])
      } else if (result.actions[i] instanceof Object) {
        this.registerAction(result.actions[i][0], new Action(this).fromJSON(result.actions[i][1]))
      }
    }

    this.log = new Log(this.id, 'Application', this.name, this.config.logLevel, this.outputPipe, this.errorPipe)

    return this
  }

  /**
   * [setPublicFlow description]
   * @param {[type]} flow [description]
   */
  setPublicFlow (flow) {
    this.log.debug(`Connecting ${flow.name}:${flow.id} flow to ${this.name} application`)
    this.publicFlow = flow
    if (this.flows.indexOf(flow) === -1) {
      this.registerFlow(flow)
    }
  }

  /**
   * [dispatch description]
   * @param  {[type]} source      [description]
   * @param  {[type]} eventName   [description]
   * @param  {[type]} event       [description]
   * @param  {[type]} destination [description]
   * @return {[type]}             [description]
   */
  dispatch (type, request, flow, from, retries = 0, error) {
    this.log.debug(`Dispatch starts from ${from.name} with type ${type}`)

    if (from.to) {
      if (from.to instanceof Array) {
        // Dealing with a Node or Milestone
        let dispatched = false

        for (var channel = 0, len = from.to.length; channel < len; channel++) {
          if (from.to[channel].accepts.indexOf(type) > -1) {
            this.log.debug(`... and leads to ${from.to[channel].name}`)
            this.log.debug(`Dispatching ${type} to ${from.to[channel].name}`)
            const event = new Event(this, undefined, type, request, from.to[channel], flow, retries)
            this.eventQueue.push(event)
            dispatched = true
          }
        }

        if (!dispatched) {
          if (error) {
            // Throw an error if an Error channel was not found
            this.emit('Flow.end', flow, request, error)
          }

          this.emit('Flow.end', flow, request)
        }
      } else {
        if (error) {
          // Throw an error if an Error channel was not found
          this.emit('Flow.end', flow, request, error)
        } else {
          // Dealing with a Channel
          this.log.debug('... and leads to', from.to.name)
          const event = new Event(this, undefined, type, request, from.to, flow, retries)
          this.eventQueue.push(event)
        }
      }
    } else {
      if (error) {
        // Throw an error if an Error channel was not found
        this.emit('Flow.end', flow, request, error)
      } else {
        this.log.debug(`... and leads to ${from.to.name}`)
        const event = new Event(this, undefined, type, request, from.to, flow, retries)
        this.eventQueue.push(event)
      }
    }
  }

  /**
   * [dispatch description]
   * @param  {[type]} source      [description]
   * @param  {[type]} eventName   [description]
   * @param  {[type]} event       [description]
   * @param  {[type]} destination [description]
   * @return {[type]}             [description]
   */
  processEvents () {
    this.eventQueue.process()
  }

  /**
   * [registerAction description]
   * @param  {[type]} name   [description]
   * @param  {[type]} method [description]
   * @return {[type]}        [description]
   */
  registerAction (name, action) {
    this.actions.set(name, action)
    return action
  }

  /**
   * [getAction description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  getAction (name) {
    return this.actions.get(name)
  }

  /**
   * [requireAction description]
   * @param  {[type]} actionName [description]
   * @param  {[type]} method     [description]
   * @return {[type]}            [description]
   */
  requireAction (actionName, method) {
    let action = this.getAction(actionName)
    if (!action) {
      action = this.registerAction(actionName, new Action(this, undefined, actionName, method))
    }
    return action
  }

  /**
   * [getFlow description]
   * @param  {[type]} nameOrId [description]
   * @return {[type]}          [description]
   */
  getFlow (nameOrId) {
    for (var i = 0, len = this.flows.length; i < len; i++) {
      if (this.flows[i].id === nameOrId || this.flows[i].name === nameOrId) {
        return this.flows[i]
      }
    }
    return false
  }

  getFlowByHttp (method, path) {
    for (var i = 0, len = this.flows.length; i < len; i++) {
      if (this.flows[i].endpointMethod === method && this.flows[i].endpointRoute === path) {
        return this.flows[i]
      }
    }
    return false
  }

  /**
   * [getUniqueId description]
   * @return {[type]} [description]
   */
  getUniqueId () {
    return IdGenerator()()
  }

  /**
   * [registerFlow description]
   * @param  {[type]} flow [description]
   * @return {[type]}      [description]
   */
  registerFlow (flow) {
    for (var index = 0, len = this.flows.length; index < len; index++) {
      // Overwrite any flow with matching unique data
      if (this.flows[index].id === flow.id || (this.flows[index].endpointRoute === flow.endpointRoute && this.flows[index].endpointMethod === flow.endpointMethod)) {
        this.flows[flow] = flow
        return
      }
    }
    this.flows.push(flow)
  }

  /**
   * [connect description]
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  connect (node) {
    this.log.debug(`Connecting ${node.name}:${node.id} to ${this.name} applicaiton`)
    this.publicFlow.connect(node)
  }

  /**
   * [emit description]
   * @param  {[type]} eventType [description]
   * @param  {[type]} request   [description]
   * @return {[type]}           [description]
   */
  async emit (type, source, request, error) {
    for (const listener of this.listeners) {
      if (listener.eventType === type) {
        await listener.method(source, request, error)
      }
    }

    const data = source.id !== undefined && source.name !== undefined
      ? {
        id: source.id,
        name: source.name
      }
      : source

    const state = request.getState
      ? request.getState()
      : request

    const message = {
      type,
      data,
      state,
      error
    }

    this.onEvent(message)

    if (this.config.silent === false) {
      if (error) {
        this.errorPipe.write(stringify(message))
      } else {
        this.outputPipe.write(stringify(message))
      }
    }
  }

  /**
   * [on description]
   * @param  {[type]} eventType [description]
   * @param  {[type]} method    [description]
   * @return {[type]}           [description]
   */
  on (eventType, method) {
    const listener = {
      eventType,
      method
    }
    this.listeners.push(listener)
    return listener
  }

  /**
   * [off description]
   * @param  {[type]} eventType [description]
   * @return {[type]}           [description]
   */
  off (listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * [request description]
   * @param  {[type]} method [description]
   * @param  {[type]} path   [description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  async request (method, path, params) {
    this.log.info(`Requesting ${method} ${path} with ${params}...`)

    const flow = this.getFlowByHttp(method, path)

    if (typeof params === 'string') {
      params = querystring.parse(params)
    } else if (!(params instanceof Object)) {
      throw new TypeError(`Unknown flow request of type ${typeof params}`)
    }

    this.emit('Request.start', this, params)

    const request = new Request(this, params, flow, flow.to)

    const result = await flow.request(params, request)

    this.emit('Request.end', this, request)

    return result
    /*
    const promise = this.delegate.send('executeAction', {
      method,
      path,
      params
    })

    if (promise) {
      return promise
    } else {
      return this.executeAction(method, path, params)
    }
    */
  }

  /**
   * [execute description]
   * @param  {[type]} method [description]
   * @param  {[type]} path   [description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  /*
  async executeAction (method, path, params) {
    this.log.debug('Starting Request...')
    const flow = this.getFlowByHttp(method, path)

    if (typeof params === 'string') {
      params = querystring.parse(params)
    } else if (!(params instanceof Object)) {
      throw new TypeError(`Unknown flow request of type ${typeof params}`)
    }

    this.emit('Request.start', this, params)

    const request = new Request(this, params, flow, flow.to)

    const result = await flow.request(params, request)

    this.emit('Request.end', this, request)

    return result
  }
  */
}

export { Application as default }
