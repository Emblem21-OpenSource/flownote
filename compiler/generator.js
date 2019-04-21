import Action from '../src/action'
import StandardChannel from '../src/channels/standardChannel'
import ErrorChannel from '../src/channels/errorChannel'
import NamedChannel from '../src/channels/namedChannel'
import StandardNode from '../src/nodes/standardNode'
import StandardMilestone from '../src/nodes/standardMilestone'
import Flow from '../src/flow'

const fs = require('fs')

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
   * [getNodeInstance description]
   * @param  {[type]} nodeName [description]
   * @return {[type]}          [description]
   */
  getNodeInstance (nodeName) {
    const config = this.nodeFactories[nodeName] || {
      tags: [],
      actions: []
    }

    return new StandardNode(this.application, undefined, nodeName, undefined, config.tags, config.actions)
  }

  /**
   * [FlowTypes description]
   * @param {[type]} flow [description]
   */
  FlowTypes (flow) {
    // console.log('FlowTypes')
    return flow.eval()
  }

  /**
   * [NodeTypes description]
   * @param {[type]} node [description]
   */
  NodeTypes (node) {
    // console.log('NodeTypes')
    return node.eval()
  }

  /**
   * [PathTypes description]
   * @param {[type]} path [description]
   */
  PathTypes (path) {
    // console.log('PathTypes')
    return path.eval()
  }

  /**
   * [Expression description]
   * @param {[type]} line [description]
   */
  Expression (line) {
    // console.log('Expression')
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
    // console.log('FlowDefinition')
    const method = httpMethod.eval()
    const endpoint = '/' + httpEndpoint.eval().join('/')

    if (this.application.getFlowByHttp(method, endpoint)) {
      throw new Error(`Flow definition already exists for the ${method} ${endpoint} endpoint.`)
    }

    const flow = new Flow(this.application, undefined, flowName.eval(), config.eval(), undefined, method, endpoint, undefined)
    const pathChain = path.eval()
    const rootNode = pathChain[0]

    let lastStep = pathChain[0]

    for (var i = 1, len = pathChain.length; i < len; i++) {
      const step = pathChain[i]
      if (step !== undefined) {
        if (lastStep instanceof StandardNode) {
          // When dealing with milestones, we have to change the lastStep to the milestone
          const milestone = lastStep.hasMilestone()
          if (milestone) {
            lastStep = milestone
          }
        }

        lastStep.connect(step)
        lastStep = step
      }
    }

    flow.connect(rootNode)
    this.application.registerFlow(flow)
  }

  /**
   * [NodeDefinition description]
   * @param {[type]} nodeName   [description]
   * @param {[type]} properties [description]
   * @param {[type]} actions    [description]
   */
  NodeDefinition (nodeLabel, properties, actions) {
    // console.log('NodeDefinition')
    const nodeName = nodeLabel.eval()

    if (this.nodeAliases[nodeName]) {
      return this.nodeAliases[nodeName]
    }

    if (this.nodeFactories[nodeName] === undefined) {
      this.nodeFactories[nodeName] = {
        tags: [ /* @TODO */ ],
        config: properties.eval(),
        actions: actions.eval()
      }
    } else {
      throw new Error(`Node definition already exists for the ${nodeName}.`)
    }
  }

  /**
   * [Actions description]
   * @param {[type]} actions [description]
   */
  Actions (actions) {
    // console.log('Actions')
    const list = actions.eval()
    const result = []

    list.forEach(actionLabel => {
      if (actionLabel !== undefined) {
        const action = this.application.requireAction(actionLabel, new Function(`return function ${actionLabel} () {
          // @TODO Fill out this stub
        }`)())
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
    // console.log('Path')
    const rootNode = node.eval()
    const channelInstance = channel.eval()
    const steps = path.eval()

    let lastStep = channelInstance

    // console.log('> Pathing out', rootNode.name, steps.length)
    steps.forEach(step => {
      if (step !== undefined) {
        if (lastStep instanceof StandardNode) {
          // When dealing with milestones, we have to change the lastStep to the milestone
          const milestone = lastStep.hasMilestone()
          if (milestone) {
            lastStep = milestone
          }
        }

        lastStep.connect(step)
        lastStep = step
      }
    })

    // console.log('>>> finalizing', channelInstance.name, 'to', rootNode.name)
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
    // console.log('NonemptyListOf')
    const tokenInstance = token.eval()
    const type = token.ctorName

    if (tokenInstance === undefined) {
      // Blank line
      return []
    }

    if (type === 'Nodes') {
      // Dealing with a Path list
      const separatorList = separator.eval()
      const tokensList = tokens.eval()
      const result = [ tokenInstance ]

      for (var i = 0, len = separatorList.length; i < len; i++) {
        result.push(separatorList[i])
        result.push(tokensList[i])
      }
      return result
    } else if (type === 'Property') {
      // Properties
      return tokenInstance.concat(tokens.eval())
    } else if (type === 'label') {
      // Actions
      return [ tokenInstance ].concat(tokens.eval())
    } else {
      throw new Error('Unknown ctorName: ' + type)
    }
  }

  /**
   * [Import description]
   * @param {[type]} fileName  [description]
   * @param {[type]} extension [description]
   */
  Import (fileName, extension) {
    // console.log('Import')
    // @TODO Register action modules to the app
    // const contents = fs.readFileSync(`${fileName.eval()}.${extension.eval()}`)
    // @TODO
    return {}
  }

  /**
   * [Nodes description]
   * @param {[type]} node [description]
   */
  Nodes (node) {
    // console.log('Nodes')
    return node.eval()
  }

  /**
   * [LinguisticNodes description]
   * @param {[type]} node [description]
   */
  LinguisticNodes (node) {
    // console.log('LinguisticNodes')
    return node.eval()
  }

  /**
   * [Milestone description]
   * @param {[type]} nodeName [description]
   */
  Milestone (nodeName) {
    const node = nodeName.eval()
    const channel = new StandardChannel(this.application, undefined, 'Plain', undefined, [])
    const milestone = new StandardMilestone(this.application, undefined, `Milestone`, 'fcfs', [], [])

    milestone.config.silent = node.config.silent

    node.connect(channel)
    channel.connect(milestone)
    return node
  }

  /**
   * [LinguisticMilestone description]
   * @param {[type]} nodeName [description]
   */
  LinguisticMilestone (nodeName) {
    // console.log('LinguisticMilestone')
    return new StandardMilestone(this.application, undefined, `Milestone`, 'fcfs', [], [])
  }

  /**
   * [Node description]
   * @param {[type]} node [description]
   */
  Node (node) {
    // console.log('Node')
    return node.eval()
  }

  /**
   * [WaitFor description]
   * @param {[type]} nodeName [description]
   * @param {[type]} waitFor [description]
   */
  WaitFor (nodeName, waitFor) {
    const node = nodeName.eval()
    const waitForAction = waitFor.eval()
    const action = new Action(this.application, undefined, `waitFor${waitForAction}`, async function () {
      await this.waitFor(waitForAction)
    })
    node.addAction(action, node.actions.length - 1)
    return node
  }

  /**
   * [NodeBase description]
   * @param {[type]} node [description]
   */
  NodeBase (node) {
    // console.log('NodeBase')
    return node.eval()
  }

  /**
   * [SilentNode description]
   * @param {[type]} nodeName [description]
   */
  SilentNode (node) {
    // console.log('SilentNode')
    const nodeInstance = node.eval()

    if (this.nodeAliases[nodeInstance.name]) {
      throw new Error('Cannot modify labeled a Path root.')
    }

    nodeInstance.config.silent = true

    return nodeInstance
  }

  /**
   * [IdentityNode description]
   * @param {[type]} nodeName   [description]
   * @param {[type]} aliasLabel [description]
   */
  IdentityNode (node, aliasLabel) {
    // console.log('IdentityNode')
    const nodeInstance = node.eval()
    const alias = aliasLabel.eval()

    if (!this.nodeAliases[alias]) {
      this.nodeAliases[alias] = nodeInstance
    }

    return this.nodeAliases[alias]
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

    return this.getNodeInstance(name)
  }

  /**
   * [Concept description]
   * @param {[type]} words [description]
   */
  Concept (words) {
    // console.log('Concept')
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
    // console.log('Channel')
    return channel.eval()
  }

  /**
   * [ErrorChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  ErrorChannel (channelName, properties) {
    // console.log('ErrorChannel')
    const name = channelName.eval()
    const props = properties.eval()
    return new ErrorChannel(this.application, undefined, name, undefined, [ name ], props.retry, props.retryDelay, [])
  }

  /**
   * [PlainChannel description]
   * @param {[type]} properties [description]
   */
  PlainChannel (properties) {
    // console.log('PlainChannel')
    const props = properties.eval()
    return new StandardChannel(this.application, undefined, 'Plain', undefined, [], props.retry, props.retryDelay, [])
  }

  /**
   * [NamedChannel description]
   * @param {[type]} channelName [description]
   * @param {[type]} properties  [description]
   */
  NamedChannel (channelName, properties) {
    // console.log('NamedChannel')
    const name = channelName.eval()
    const props = properties.eval()
    return new NamedChannel(this.application, undefined, name, undefined, [ name ], props.retry, props.retryDelay, [])
  }

  /**
   * [Properties description]
   * @param {[type]} properties [description]
   */
  Properties (properties) {
    // console.log('Properties')
    const result = {}
    const propertiesInstance = properties.eval()

    propertiesInstance.forEach(property => {
      if (property !== undefined) {
        result[property[0]] = property[1]
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
    // console.log('Property')
    return [key.eval(), value.eval()]
  }

  /**
   * [HttpMethods description]
   * @param {[type]} method [description]
   */
  HttpMethods (method) {
    // console.log('HttpMethods')
    return method.eval()
  }

  /**
   * [label description]
   * @param  {[type]} label [description]
   * @return {[type]}       [description]
   */
  label (label) {
    // console.log('label')
    return label.eval().join('')
  }

  /**
   * [string description]
   * @param  {[type]} string [description]
   * @return {[type]}        [description]
   */
  string (string) {
    // console.log('string')
    return string.eval()
  }

  /**
   * [number description]
   * @return {[type]} [description]
   */
  number (number) {
    // console.log('number')
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
    // console.log('fraction')
    const num1 = whole.eval()
    const num2 = '0.' + decimal.eval()

    return (Number)(num1) + (Number)(num2)
  }

  whole (number) {
    // console.log('whole')
    return (Number)(number.eval())
  }

  /**
   * [space description]
   * @param  {[type]} space [description]
   * @return {[type]}       [description]
   */
  space (space) {
    // console.log('space')
    return space.eval()
  }

  /**
   * [comment description]
   * @param  {[type]} comments [description]
   * @return {[type]}          [description]
   */
  comment (comments) {
    // console.log('comment')
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
    // console.log('multiLineComment')
    return comments.eval()
  }

  /**
   * [singleLineComment description]
   * @param  {[type]} _1       [description]
   * @param  {[type]} comments [description]
   * @return {[type]}          [description]
   */
  singleLineComment (_1, comments) {
    // console.log('singleLineComment')
    return comments.eval()
  }
}

export { Generator as default }
