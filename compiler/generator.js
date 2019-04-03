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
    this.application = application
    this.nodeFactories = {}
    this.nodeAliases = {}
  }

  /**
   * [FlowTypes description]
   * @param {[type]} flow [description]
   */
  FlowTypes (flow) {
    console.log('FlowTypes')
    return flow.eval()
  }

  /**
   * [NodeTypes description]
   * @param {[type]} node [description]
   */
  NodeTypes (node) {
    console.log('NodeTypes')
    return node.eval()
  }

  /**
   * [PathTypes description]
   * @param {[type]} path [description]
   */
  PathTypes (path) {
    console.log('PathTypes')
    return path.eval()
  }

  /**
   * [Expression description]
   * @param {[type]} line [description]
   */
  Expression (line) {
    console.log('Expression')
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
    console.log('FlowDefinition')
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
  NodeDefinition (nodeLabel, properties, actions) {
    console.log('NodeDefinition')
    const nodeName = nodeLabel.eval()

    if (this.nodeAliases[nodeName]) {
      return this.nodeAliases[nodeName]
    }

    if (this.nodeFactories[nodeName] === undefined) {
      this.nodeFactories[nodeName] = (nodeName, tags, config, actions) => {
        return new StandardNode(this.application, undefined, nodeName, undefined, tags, actions)
      }
    } else {
      throw new Error(`Node definition already exists for the ${nodeName}.`)
    }
    const propertiesInstance = properties.eval()
    return this.nodeFactories[nodeName](nodeName, [ /* @TODO */], propertiesInstance, actions.eval())
  }

  /**
   * [Actions description]
   * @param {[type]} actions [description]
   */
  Actions (actions) {
    console.log('Actions')
    const list = actions.eval()
    const result = []

    list.forEach(actionLabel => {
      if (actionLabel !== undefined) {
        const action = this.application.requireAction(actionLabel, function () {
          // @TODO Fill out this stub
        })
        result.push(action)
      }
    })

    return result
  }

  /**
   * [Path description]
   * @param {[type]} nodeName [description]
   * @param {[type]} channel  [description]
   * @param {[type]} path     [description]
   */
  Path (node, channel, path) {
    console.log('Path')
    const rootNode = node.eval()
    const steps = path.eval()
    const channelInstance = channel.eval()
    let lastNode = channelInstance

    steps.forEach(step => {
      if (step !== undefined) {
        lastNode.connect(step)
        lastNode = step
      }
    })

    rootNode.connect(channelInstance)

    return rootNode
  }

  /**
   * [NonemptyListOf description]
   * @param  {[type]} token     [description]
   * @param  {[type]} separator [description]
   * @param  {[type]} tokens    [description]
   * @return {[type]}           [description]
   */
  NonemptyListOf (token, separator, tokens) {
    console.log('NonemptyListOf')
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
    console.log('Import')
    // const contents = fs.readFileSync(`${fileName.eval()}.${extension.eval()}`)
    // @TODO
    return {}
  }

  /**
   * [Nodes description]
   * @param {[type]} node [description]
   */
  Nodes (node) {
    console.log('Nodes')
    return node.eval()
  }

  /**
   * [LinguisticNodes description]
   * @param {[type]} node [description]
   */
  LinguisticNodes (node) {
    console.log('LinguisticNodes')
    return node.eval()
  }

  /**
   * [Milestone description]
   * @param {[type]} nodeName [description]
   */
  Milestone (nodeName) {
    console.log('Milestone')
    return new StandardMilestone(this.application, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
  }

  /**
   * [LinguisticMilestone description]
   * @param {[type]} nodeName [description]
   */
  LinguisticMilestone (nodeName) {
    console.log('LinguisticMilestone')
    return new StandardMilestone(this.application, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
  }

  /**
   * [Node description]
   * @param {[type]} node [description]
   */
  Node (node) {
    console.log('Node')
    return node.eval()
  }

  /**
   * [WaitsFor description]
   * @param {[type]} nodeName [description]
   * @param {[type]} waitsFor [description]
   */
  WaitsFor (nodeName, waitsFor) {
    console.log('WaitsFor')
    // @TODO
  }

  /**
   * [NodeBase description]
   * @param {[type]} node [description]
   */
  NodeBase (node) {
    console.log('NodeBase')
    return node.eval()
  }

  /**
   * [SilentNode description]
   * @param {[type]} nodeName [description]
   */
  SilentNode (node) {
    console.log('SilentNode')
    const nodeInstance = node.eval()

    if (this.nodeAliases[nodeInstance.name]) {
      throw new Error('Cannot modify labeled a Path root.')
    }

    // @TODO nodeInstance.silence()
    return nodeInstance
  }

  /**
   * [IdentityNode description]
   * @param {[type]} nodeName   [description]
   * @param {[type]} aliasLabel [description]
   */
  IdentityNode (node, aliasLabel) {
    console.log('IdentityNode')
    const nodeInstance = node.eval()
    const alias = aliasLabel.eval()

    if (this.nodeAliases[alias]) {
      throw new Error(`The ${alias} alias already exists.`)
    } else {
      this.nodeAliases[alias] = nodeInstance
    }

    return nodeInstance
  }

  /**
   * [StandardNode description]
   * @param {[type]} nodeName [description]
   */
  StandardNode (nodeLabel) {
    const name = nodeLabel.eval()

    if (this.nodeAliases[name]) {
      return this.nodeAliases[name]
    }

    return this.nodeFactories[name](name, undefined, undefined, undefined)
  }

  /**
   * [Concept description]
   * @param {[type]} words [description]
   */
  Concept (words) {
    console.log('Concept')
    const result = []
    words.forEach(word => {
      if (word !== undefined) {
        result.push(word.eval())
      }
    })
    return result.join(' ')
  }

  /**
   * [Channel description]
   * @param {[type]} channel [description]
   */
  Channel (channel) {
    console.log('Channel')
    return channel.eval()
  }

  /**
   * [ErrorChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  ErrorChannel (channelName, properties) {
    console.log('ErrorChannel')
    const name = channelName.eval()
    const props = properties.eval()
    return new ErrorChannel(this.application, undefined, name, undefined, [ name ], props.retry, [])
  }

  /**
   * [PlainChannel description]
   * @param {[type]} properties [description]
   */
  PlainChannel (properties) {
    console.log('PlainChannel')
    const props = properties.eval()
    return new StandardChannel(this.application, undefined, 'Plain', undefined, [], props.retry, [])
  }

  /**
   * [NamedChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  NamedChannel (channelName, properties) {
    console.log('NamedChannel')
    const name = channelName.eval()
    const props = properties.eval()
    return new StandardChannel(this.application, undefined, name, undefined, [ name ], props.retry, [])
  }

  /**
   * [Properties description]
   * @param {[type]} properties [description]
   */
  Properties (properties) {
    console.log('Properties')
    const result = {}
    properties.forEach(property => {
      if (property !== undefined) {
        const propertyResult = property.eval()
        result[propertyResult[0]] = propertyResult[1]
      }
    })
    return result
  }

  /**
   * [Property description]
   * @param {[type]} key   [description]
   * @param {[type]} value [description]
   */
  Property (key, value) {
    console.log('Property')
    return [key.eval(), value.eval()]
  }

  /**
   * [HttpMethods description]
   * @param {[type]} method [description]
   */
  HttpMethods (method) {
    console.log('HttpMethods')
    return method.eval()
  }

  /**
   * [label description]
   * @param  {[type]} label [description]
   * @return {[type]}       [description]
   */
  label (label) {
    console.log('label')
    return label.eval().join('')
  }

  /**
   * [string description]
   * @param  {[type]} string [description]
   * @return {[type]}        [description]
   */
  string (string) {
    console.log('string')
    return string.eval()
  }

  /**
   * [number description]
   * @return {[type]} [description]
   */
  number (number) {
    console.log('number')
    return number.eval()
  }

  /**
   * [number description]
   * @param  {[type]} whole   [description]
   * @param  {[type]} dot     [description]
   * @param  {[type]} decimal [description]
   * @return {[type]}         [description]
   */
  fraction (whole, dot, decimal) {
    console.log('fraction')
    const num1 = whole.eval()
    const num2 = '0.' + decimal.eval()

    return (Number)(num1) + (Number)(num2)
  }

  whole (number) {
    console.log('whole')
    return (Number)(number.eval())
  }

  /**
   * [space description]
   * @param  {[type]} space [description]
   * @return {[type]}       [description]
   */
  space (space) {
    console.log('space')
    return space.eval()
  }

  /**
   * [comment description]
   * @param  {[type]} comments [description]
   * @return {[type]}          [description]
   */
  comment (comments) {
    console.log('comment')
    return comments.eval()
  }

  /**
   * [multiLineComment description]
   * @param  {[type]} _1       [description]
   * @param  {[type]} comments [description]
   * @param  {[type]} _2       [description]
   * @return {[type]}          [description]
   */
  multiLineComment (comments) {
    console.log('multiLineComment')
    return comments.eval()
  }

  /**
   * [singleLineComment description]
   * @param  {[type]} _1       [description]
   * @param  {[type]} comments [description]
   * @return {[type]}          [description]
   */
  singleLineComment (_1, comments) {
    console.log('singleLineComment')
    return comments.eval()
  }
}

export { Generator as default }
