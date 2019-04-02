import StandardChannel from '../src/channels/standardChannel'
import ErrorChannel from '../src/channels/errorChannel'
import StandardNode from '../src/nodes/standardNode'
import StandardMilestone from '../src/nodes/standardMilestone'
import Flow from '../src/flow'

// const fs = require('fs')

class Generator {
  /**
   * [constructor description]
   * @param  {[type]} application [description]
   * @return {[type]}             [description]
   */
  constructor (application) {
    this.application = this.application
    this.nodeFactories = {}
    this.nodeAliases = {}
  }

  /**
   * [Expression description]
   * @param {[type]} line [description]
   */
  Expression (line) {
    return line.eval()
  }

  /**
   * [FlowDefinition description]
   * @param {[type]} flowName     [description]
   * @param {[type]} httpMethod   [description]
   * @param {[type]} httpEndpoint [description]
   * @param {[type]} config       [description]
   * @param {[type]} path         [description]
   */
  FlowDefinition (flowName, httpMethod, httpEndpoint, config, path) {
    const method = httpMethod.eval()
    const endpoint = httpEndpoint.eval()

    if (this.application.getFlowByHttp(method, endpoint)) {
      throw new Error(`Flow definition already exists for the ${method} ${endpoint} endpoint.`)
    }

    const flow = new Flow(this.application, undefined, flowName.eval(), config.eval(), undefined, method, endpoint, undefined)
    const pathRootNode = path.eval()

    flow.connect(pathRootNode)
    this.application.registerFlow(flow)
  }

  /**
   * [NodeDefinition description]
   * @param {[type]} nodeName   [description]
   * @param {[type]} properties [description]
   * @param {[type]} actions    [description]
   */
  NodeDefinition (nodeName, properties, actions) {
    const nodeNameInstance = nodeName.eval()

    if (this.nodeFactories[nodeNameInstance] === undefined) {
      this.nodeFactories[nodeNameInstance] = (nodeName, tags, config, actions) => {
        return new StandardNode(this.application, undefined, nodeName || nodeNameInstance, undefined, tags, actions)
      }
    } else {
      throw new Error(`Node definition already exists for the ${nodeNameInstance}.`)
    }

    return this.nodeFactories[nodeNameInstance](nodeName.eval(), properties.eval().tags, actions.eval())
  }

  /**
   * [Actions description]
   * @param {[type]} actions [description]
   */
  Actions (actions) {
    const list = actions.eval()
    const result = []

    list.forEach(actionLabel => {
      const action = this.application.requireAction(actionLabel.eval(), function () {
        // @TODO Fill out this stub
      })
      result.push(action)
    })

    return result
  }

  /**
   * [Path description]
   * @param {[type]} nodeName [description]
   * @param {[type]} channel  [description]
   * @param {[type]} path     [description]
   */
  Path (nodeName, channel, path) {
    const rootNode = nodeName.eval()
    const steps = path.eval()
    const channelInstance = channel.eval()
    let lastNode = channelInstance

    steps.forEach(step => {
      lastNode.connect(step)
      lastNode = step
    })

    rootNode.connect(channelInstance)

    return rootNode
  }

  /**
   * [nonemptyListOf description]
   * @param  {[type]} token     [description]
   * @param  {[type]} separator [description]
   * @param  {[type]} tokens    [description]
   * @return {[type]}           [description]
   */
  nonemptyListOf (token, separator, tokens) {
    const separatorInstance = separator.eval()

    if (separatorInstance instanceof StandardChannel) {
      return [token.eval(), separator.eval()].concat(tokens.eval())
    } else {
      return [token.eval()].concat(tokens.eval())
    }
  }

  /**
   * [Import description]
   * @param {[type]} fileName  [description]
   * @param {[type]} extension [description]
   */
  Import (fileName, extension) {
    // const contents = fs.readFileSync(`${fileName.eval()}.${extension.eval()}`)
    // @TODO
    return {}
  }

  /**
   * [Nodes description]
   * @param {[type]} node [description]
   */
  Nodes (node) {
    return node.eval()
  }

  /**
   * [LinguisticNodes description]
   * @param {[type]} node [description]
   */
  LinguisticNodes (node) {
    return node.eval()
  }

  /**
   * [Milestone description]
   * @param {[type]} nodeName [description]
   */
  Milestone (nodeName) {
    return new StandardMilestone(this.application, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
  }

  /**
   * [LinguisticMilestone description]
   * @param {[type]} nodeName [description]
   */
  LinguisticMilestone (nodeName) {
    return new StandardMilestone(this.application, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
  }

  /**
   * [Node description]
   * @param {[type]} node [description]
   */
  Node (node) {
    return node.eval()
  }

  /**
   * [WaitsFor description]
   * @param {[type]} nodeName [description]
   * @param {[type]} waitsFor [description]
   */
  WaitsFor (nodeName, waitsFor) {
    // @TODO
  }

  /**
   * [NodeBase description]
   * @param {[type]} node [description]
   */
  NodeBase (node) {
    return node.eval()
  }

  /**
   * [SilentNode description]
   * @param {[type]} nodeName [description]
   */
  SilentNode (nodeName) {
    const name = nodeName.eval()

    if (this.nodeAliases[name]) {
      return this.nodeAliases[name]
    }

    return this.nodeFactories[name](name, undefined, undefined, {
      silent: true
    })
  }

  /**
   * [IdentityNode description]
   * @param {[type]} nodeName   [description]
   * @param {[type]} aliasLabel [description]
   */
  IdentityNode (nodeName, aliasLabel) {
    const name = nodeName.eval()
    const alias = aliasLabel.eval()

    const node = this.nodeFactories[name](name, undefined, undefined, {
      silent: true
    })

    if (this.nodeAliases[alias] === undefined) {
      this.nodeAliases[alias] = node
    }

    return node
  }

  /**
   * [StandardNode description]
   * @param {[type]} nodeName [description]
   */
  StandardNode (nodeName) {
    const name = nodeName.eval()

    if (this.nodeAliases[name]) {
      return this.nodeAliases[name]
    }

    return this.nodeFactories[name](name, undefined, undefined, {})
  }

  /**
   * [Concept description]
   * @param {[type]} words [description]
   */
  Concept (words) {
    const result = []
    words.forEach(word => {
      result.push(word.eval())
    })
    return result.join(' ')
  }

  /**
   * [Channel description]
   * @param {[type]} channel [description]
   */
  Channel (channel) {
    return channel.eval()
  }

  /**
   * [ErrorChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  ErrorChannel (channelName, properties) {
    const name = channelName.eval()
    const props = properties.eval()
    return new ErrorChannel(this.application, undefined, name, undefined, [ name ], props.retry, [])
  }

  /**
   * [PlainChannel description]
   * @param {[type]} properties [description]
   */
  PlainChannel (properties) {
    const props = properties.eval()
    return new StandardChannel(this.application, undefined, 'Plain', undefined, [], props.retry, [])
  }

  /**
   * [NamedChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  NamedChannel (channelName, properties) {
    const name = channelName.eval()
    const props = properties.eval()
    return new StandardChannel(this.application, undefined, name, undefined, [ name ], props.retry, [])
  }

  /**
   * [Properties description]
   * @param {[type]} properties [description]
   */
  Properties (properties) {
    const result = {}
    properties.forEach(property => {
      const propertyResult = property.eval()
      result[propertyResult[0]] = propertyResult[1]
    })
    return result
  }

  /**
   * [Property description]
   * @param {[type]} key   [description]
   * @param {[type]} value [description]
   */
  Property (key, value) {
    return [key.eval(), value.eval()]
  }

  /**
   * [HttpMethods description]
   * @param {[type]} method [description]
   */
  HttpMethods (method) {
    return method.eval()
  }

  /**
   * [label description]
   * @param  {[type]} label [description]
   * @return {[type]}       [description]
   */
  label (label) {
    return label.eval()
  }

  /**
   * [string description]
   * @param  {[type]} string [description]
   * @return {[type]}        [description]
   */
  string (string) {
    return string.eval()
  }

  /**
   * [number description]
   * @param  {[type]} whole   [description]
   * @param  {[type]} dot     [description]
   * @param  {[type]} decimal [description]
   * @return {[type]}         [description]
   */
  number (whole, dot, decimal) {
    const num1 = whole.eval()
    let num2 = '0'

    if (dot.eval()) {
      num2 = '0.' + decimal.eval()
    } else {
      num2 = '0'
    }

    return (Number)(num1) + (Number)(num2)
  }

  /**
   * [space description]
   * @param  {[type]} space [description]
   * @return {[type]}       [description]
   */
  space (space) {
    return space.eval()
  }

  /**
   * [comment description]
   * @param  {[type]} comments [description]
   * @return {[type]}          [description]
   */
  comment (comments) {
    return comments.eval()
  }
}

export { Generator as default }
