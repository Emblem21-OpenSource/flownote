import Node from './node'
import Spider from './spider'

const CommonClass = require('./utils/commonClass')
const Request = require('./request')
const Log = require('./utils/log')

const noop = () => {}

class Flow extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} id             [description]
   * @param  {[type]} name           [description]
   * @param  {[type]} config         [description]
   * @param  {[type]} to  [description]
   * @param  {[type]} endpointRoute  [description]
   * @param  {[type]} endpointMethod [description]
   * @param  {[type]} endpointParams [description]
   * @return {[type]}                [description]
   */
  constructor (application, id, name, config, to, endpointMethod, endpointRoute, endpointParams) {
    super()
    this.application = application
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        config: Object.assign(config || {}, {}),
        to,
        endpointMethod: endpointMethod || 'GET',
        endpointRoute: endpointRoute || '/' + name || 'Unnamed',
        endpointParams: endpointParams || []
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
      config: this.config,
      to: this.to,
      endpointMethod: this.endpointMethod,
      endpointRoute: this.endpointRoute,
      endpointParams: this.endpointParams
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
      throw new Error(`Expected Flow JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.name = result.name
    this.config = result.config

    if (result.to instanceof Node) {
      this.connect(result.to)
    } else if (result.to !== undefined) {
      let existingNode

      if (this.application.publicFlow !== undefined) {
        existingNode = new Spider().search(this.application, result.to.id)
      }

      if (existingNode) {
        this.connect(existingNode)
      } else {
        this.connect(new Node(this.application).fromJSON(result.to))
      }
    }

    if (result.to instanceof Node) {
      this.connect(result.to)
    } else if (result.to !== undefined) {
      let existingNode
      if (this.application.publicFlow !== undefined) {
        existingNode = new Spider().search(this.application, result.to.id)
      }

      if (existingNode) {
        this.connect(existingNode)
      } else {
        this.connect(new Node(this.application).fromJSON(result.to))
      }
    }

    this.endpointRoute = result.endpointRoute
    this.endpointMethod = result.endpointMethod
    this.endpointParams = result.endpointParams
    this.onError = noop
    this.onComplete = noop

    this.log = new Log(this.id, 'Flow', this.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

    return this
  }

  /**
   * Connects a node or milestone to a specific location within the flow
   * @return {[type]} [description]
   */
  connect (node) {
    this.application.log.debug(`Connecting node ${node.name}:${node.id} to ${this.name} flow`)
    this.to = node
  }

  /**
   * [request description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  request (params, request) {
    this.application.emit('Flow.start', this, request)

    return new Promise((resolve, reject) => {
      this.log.debug(`Waiting for Request ${request.id} to complete...`)
      const listener = this.application.on('Flow.end', (source, resultRequest, error) => {
        this.log.debug('Handling flow end...')

        if (error !== undefined) {
          return reject(error)
        }

        if (resultRequest === request) {
          this.application.off(listener)
          this.log.debug(`Request ${request.id} complete.`)
          resolve(resultRequest.asResult())
        }
      })

      this.log.debug('Dispatching flow...')
      this.application.dispatch(`Flow.start`, request, this, this)
    })
  }

  /**
   * Commits all accumulated actions within a request
   * @param  {[type]} event         [description]
   * @param  {[type]} actionContext [description]
   * @return {[type]}               [description]
   */
  async process (event, actionContext) {
    this.log.debug('Processing flow', this.name)
    this.application.emit('Flow.start', this, event.request)

    if (this.to !== undefined) {
      this.log.debug('Dispatching event to proceed to node from flow...')
      this.application.dispatch(`Node.${this.to.name}`, event.request, this, this.to)
    }
  }
}

export { Flow as default }
