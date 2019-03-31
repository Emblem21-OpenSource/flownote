import Application from './application'
import Milestone from './milestone'
import StandardChannel from './channels/standardChannel'
import ErrorChannel from './channels/errorChannel'
import StandardNode from './nodes/standardNode'
import Flow from './flow'
import Spider from './spider'

const Action = require('./action')
const fs = require('fs')
const ohm = require('ohm-js')

class Semantics {
  /**
   * [constructor description]
   * @param  {[type]} grammarFilePath [description]
   * @return {[type]}                 [description]
   */
  constructor (grammarFilePath) {
    this.grammer = undefined
    this.grammarFilePath = grammarFilePath
  }

  /**
   * Loads a grammar file into the Semantics
   */
  async loadGrammar () {
    if (!this.isGrammarLoaded()) {
      return new Promise((resolve, reject) => {
        fs.readFile(this.grammarFilePath, 'utf8', (err, contents) => {
          if (err) {
            reject(err)
          } else {
            this.grammar = ohm.grammar(contents)
            resolve(contents)
          }
        })
      })
    }
  }

  /**
   * Returns if the grammar file has been properly loaded
   */
  isGrammarLoaded () {
    return this.grammar !== undefined
  }

  /**
   * Determines if the content is valid FlowNote grammar
   */
  isValid (content) {
    if (this.isGrammarLoaded()) {
      const match = this.grammar.match(content)
      return match.succeeded()
    }
  }

  /**
   * Returns the Ohm grammar trace of a string.
   */
  trace (content) {
    if (this.isGrammarLoaded()) {
      return this.grammar.trace(content)
    }
  }

  /**
   * Returns a valid FlowNote structure
   * @TODO
   * @param  {String} content
   * @return {Flow}
   */
  evaluate (content, application) {
    if (application === undefined) {
      application = new Application(undefined, 'App', {}, undefined, undefined, [ /* actions */ ], undefined, undefined, undefined)
    }

    const nodeFactory = {}
    const nodeAliases = {}
    let targetFlow

    const semantics = this.grammar.createSemantics().addOperation('eval', {
      Expression: (line) => {
        return line.eval()
      },
      FlowDefinition: (_1, flowName, _2, httpMethod, _3, httpEndpoint, _4, config, _5, path) => {
        const method = httpMethod.eval()
        const endpoint = httpEndpoint.eval()

        const flow = application.getFlowByHttp(method, endpoint)

        if (flow) {
          targetFlow = flow
        } else {
          targetFlow = new Flow(application, undefined, flowName.eval(), config.eval(), undefined, method, endpoint, undefined)
        }

        const steps = path.asIteration().value
        let firstStep, lastStep

        steps.forEach(step => {
          const stepInstance = step.eval()

          if (firstStep !== undefined) {
            firstStep = stepInstance
          }

          if (lastStep !== undefined) {
            lastStep.connect(stepInstance)
          }

          lastStep = stepInstance
        })

        targetFlow.connect(firstStep)
      },
      LinguisticFlowDefinition: (flowName, _1, _2, httpMethod, _3, httpEndpoint, _4, config, _5, _6, path) => {
        // @TODO
      },
      NodeDefinition: (_1, nodeName, properties, _2, actions) => {
        const nodeNameInstance = nodeName.eval()

        if (nodeFactory[nodeNameInstance] === undefined) {
          nodeFactory[nodeNameInstance] = (nodeName, tags, config, actions) => {
            return new StandardNode(application, undefined, nodeName || nodeNameInstance, undefined, tags, actions)
          }
        }
        return nodeFactory[nodeNameInstance](nodeName.eval(), properties.eval().tags, actions.eval())
      },
      LinguisticNodeDefinition: (nodeName, _2, _3, actions) => {
        // @TODO
      },
      Actions: (actions) => {
        const list = actions.asIteration().value
        const result = []
        list.forEach(actionLabel => {
          const action = application.requireAction(actionLabel.eval(), function () {
            // @TODO Fill out this stub
          })
          result.push(action)
        })
        return result
      },
      LinguisticActionsPlural: (actions, _1, action) => {
        // @TODO
      },
      LinguisticActionsSingular: (action) => {
        // @TODO
      },
      LinguisticActions: (action) => {
        // @TODO
      },
      Path: (nodeName, channel, path) => {
        // @TODO
      },
      LinguisticPath: (nodeName, channel, path) => {
        // @TODO
      },
      LinguisticPathSeparator: (_, channel) => {
        return channel.eval()
      },
      Import: (_1, _2, fileName, _3, extension) => {
        const contents = fs.readFileSync(`${fileName.eval()}.${extension.eval()}`)
        // @TODO
        return {}
      },
      Nodes: (node) => {
        return node.eval()
      },
      LinguisticNodes: (node) => {
        return node.eval()
      },
      Milestone: (nodeName, _) => {
        return new Milestone(application, targetFlow, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
      },
      LinguisticMilestone: (nodeName, _) => {
        return new Milestone(application, targetFlow, undefined, `Commit ${nodeName}`, 'fcfs', [], [])
      },
      Node: (node) => {
        return node.eval()
      },
      WaitsFor: (nodeName, _, waitsFor) => {

      },
      NodeBase: (node) => {
        return node.eval()
      },
      SilentNode: (nodeName, _) => {
        const name = nodeName.eval()

        if (nodeAliases[name]) {
          return nodeAliases[name]
        }

        nodeFactory[name](name, undefined, undefined, {
          silent: true
        })
      },
      IdentityNode: (nodeName, _, aliasLabel) => {
        const name = nodeName.eval()
        const alias = aliasLabel.eval()

        const node = nodeFactory[name](name, undefined, undefined, {
          silent: true
        })

        if (nodeAliases[alias] === undefined) {
          nodeAliases[alias] = node
        }

        return node
      },
      StandardNode: (nodeName) => {
        const name = nodeName.eval()

        if (nodeAliases[name]) {
          return nodeAliases[name]
        }

        nodeFactory[name](name, undefined, undefined, {})
      },
      LinguisticNode: (node) => {
        return node.eval()
      },
      LinguisticWaitsFor: (nodeName, _, alias) => {

      },
      LinguisticNodeBase: (node) => {
        return node.eval()
      },
      LinguisticSilentNode: (_, nodeName) => {
        // @TODO
      },
      LinguisticIdentityNode: (nodeName, _1, alias, _2) => {
        // @TODO
      },
      LinguisticStandardNode: (nodeName) => {
        // @TODO
      },
      Concept: (words) => {
        const result = []
        words.forEach(word => {
          result.push(word.eval())
        })
        return result.join(' ')
      },
      Channel: (channel) => {
        return channel.eval()
      },
      ErrorChannel: (_1, channelName, properties, _2) => {
        const name = channelName.eval()
        const props = properties.eval()
        return new ErrorChannel(application, undefined, name, undefined, [ name ], props.retry, [])
      },
      PlainChannel: (_1, properties, _2) => {
        const props = properties.eval()
        return new StandardChannel(application, undefined, 'Plain', undefined, [], props.retry, [])
      },
      NamedChannel: (_1, channelName, properties, _2) => {
        const name = channelName.eval()
        const props = properties.eval()
        return new StandardChannel(application, undefined, name, undefined, [ name ], props.retry, [])
      },
      LinguisticChannel: (channel) => {
        return channel.eval()
      },
      LinguisticErrorChannel: (_1, channelName, properties, _2) => {
        // @TODO
      },
      LinguisticPlainChannel: (_1, properties, _2) => {
        // @TODO
      },
      LinguisticNamedChannel: (_1, channelName, properties, _2) => {
        // @TODO
      },
      Properties: (_1, properties, _2) => {
        const result = {}
        properties.forEach(property => {
          const propertyResult = property.eval()
          result[propertyResult[0]] = propertyResult[1]
        })
        return result
      },
      Property: (key, _, value) => {
        return [key.eval(), value.eval()]
      },
      HttpMethods: (method) => {
        return method.eval()
      },
      label: (label) => {
        return label.eval()
      },
      string: (_1, string, _2) => {
        return string.eval()
      },
      number: (whole, _, decimal) => {
        const num1 = whole.eval()
        let num2 = '0'

        if (_.eval()) {
          num2 = '0.' + decimal.eval()
        } else {
          num2 = '0'
        }

        return (Number)(num1) + (Number)(num2)
      },
      space: (space) => {
        return space.eval()
      },
      comment: (_1, comments, _2) => {
        return comments.eval()
      }
    })

    const match = this.grammar.match(content)
    semantics(match).eval()
    return application
  }
}

export { Semantics as default }
