import Application from './application'
import Compiler from './compiler'

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
  compile (content, application) {
    if (application === undefined) {
      application = new Application(undefined, 'App', {}, undefined, undefined, [ /* actions */ ], undefined, undefined, undefined)
    }

    this.compiler = new Compiler(application)

    const semantics = this.grammar.createSemantics().addOperation('eval', {
      Expression: (line) => {
        return this.compiler.Expression(line)
      },
      FlowDefinition: (_1, flowName, _2, httpMethod, _3, httpEndpoint, _4, config, _5, path) => {
        return this.compiler.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
      },
      LinguisticFlowDefinition: (flowName, _1, _2, httpMethod, _3, httpEndpoint, _4, config, _5, _6, path) => {
        return this.compiler.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
      },
      NodeDefinition: (_1, nodeName, properties, _2, actions) => {
        return this.compiler.NodeDefinition(nodeName, properties, actions)
      },
      LinguisticNodeDefinition: (nodeName, _2, _3, actions) => {
        return this.compiler.NodeDefinition(nodeName, {}, actions)
      },
      Actions: (actions) => {
        return this.compiler.Actions(actions)
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
        return this.compiler.Path(nodeName, channel, path)
      },
      nonemptyListOf: (token, separator, tokens) => {
        return this.compiler.nonemptyListOf(token, separator, tokens)
      },
      LinguisticPath: (nodeName, channel, path) => {
        return this.compiler.Path(nodeName, channel, path)
      },
      LinguisticPathSeparator: (_, channel) => {
        // @TODO
      },
      Import: (_1, _2, fileName, _3, extension) => {
        return this.compiler.Import(fileName, extension)
      },
      Nodes: (node) => {
        return this.compiler.Nodes(node)
      },
      LinguisticNodes: (node) => {
        return this.compiler.Nodes(node)
      },
      Milestone: (nodeName, _) => {
        return this.compiler.Milestone(nodeName)
      },
      LinguisticMilestone: (nodeName, _) => {
        return this.compiler.Milestone(nodeName)
      },
      Node: (node) => {
        return this.compiler.Node(node)
      },
      WaitsFor: (nodeName, _, waitsFor) => {
        return this.compiler.WaitsFor(nodeName, waitsFor)
      },
      NodeBase: (node) => {
        return this.compiler.NodeBase(node)
      },
      SilentNode: (nodeName, _) => {
        return this.compiler.SilentNode(nodeName)
      },
      IdentityNode: (nodeName, _, aliasLabel) => {
        return this.compiler.IdentityNode(nodeName, aliasLabel)
      },
      StandardNode: (nodeName) => {
        return this.compiler.StandardNode(nodeName)
      },
      LinguisticNode: (node) => {
        return this.compiler.Node(node)
      },
      LinguisticWaitsFor: (nodeName, _, alias) => {
        return this.compiler.WaitsFor(nodeName, alias)
      },
      LinguisticNodeBase: (node) => {
        return this.compiler.NodeBase(node)
      },
      LinguisticSilentNode: (_, nodeName) => {
        return this.compiler.SilentNode(nodeName)
      },
      LinguisticIdentityNode: (nodeName, _1, aliasLabel, _2) => {
        return this.compiler.IdentityNode(nodeName, aliasLabel)
      },
      LinguisticStandardNode: (nodeName) => {
        return this.compiler.StandardNode(nodeName)
      },
      Concept: (words) => {
        return this.compiler.Concept(words)
      },
      Channel: (channel) => {
        return this.compiler.Channel(channel)
      },
      ErrorChannel: (_1, channelName, properties, _2) => {
        return this.compiler.ErrorChannel(channelName, properties)
      },
      PlainChannel: (_1, properties, _2) => {
        return this.compiler.PlainChannel(properties)
      },
      NamedChannel: (_1, channelName, properties, _2) => {
        return this.compiler.NamedChannel(channelName, properties)
      },
      LinguisticChannel: (channel) => {
        return this.compiler.Channel(channel)
      },
      LinguisticErrorChannel: (_1, channelName, properties, _2) => {
        return this.compiler.ErrorChannel(channelName, properties)
      },
      LinguisticPlainChannel: (_1, properties, _2) => {
        return this.compiler.PlainChannel(properties)
      },
      LinguisticNamedChannel: (_1, channelName, properties, _2) => {
        return this.compiler.NamedChannel(channelName, properties)
      },
      Properties: (_1, properties, _2) => {
        return this.compiler.Properties(properties)
      },
      Property: (key, _, value) => {
        return this.compiler.Property(key, value)
      },
      HttpMethods: (method) => {
        return this.compiler.HttpMethods(method)
      },
      label: (label) => {
        return this.compiler.label(label)
      },
      string: (_1, string, _2) => {
        return this.compiler.string(string)
      },
      number: (whole, dot, decimal) => {
        return this.compiler.number(whole, dot, decimal)
      },
      space: (space) => {
        return this.compiler.space(space)
      },
      comment: (_1, comments, _2) => {
        return this.compiler.comment(comments)
      }
    })

    const match = this.grammar.match(content)
    semantics(match).eval()
    return application
  }
}

export { Semantics as default }
