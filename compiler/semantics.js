import Generator from './generator'

const ohm = require('ohm-js')
const fs = require('fs')

class Semantics {
  /**
   * [constructor description]
   * @return {[type]}                 [description]
   */
  constructor () {
    this.grammer = undefined
  }

  /**
   * Loads a grammar file into the Semantics
   */
  async loadGrammar (grammarFilePath) {
    if (!this.isGrammarLoaded()) {
      return new Promise((resolve, reject) => {
        fs.readFile(grammarFilePath, 'utf8', (err, contents) => {
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
   * [getGenerator description]
   * @param  {[type]} application [description]
   * @return {[type]}             [description]
   */
  getGenerator (application) {
    const generator = new Generator(application)

    return this.grammar.createSemantics().addOperation('eval', {
      Expression: (line) => {
        return generator.Expression(line)
      },
      FlowDefinition: (_1, flowName, _2, httpMethod, _3, httpEndpoint, _4, config, _5, path) => {
        return generator.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
      },
      LinguisticFlowDefinition: (flowName, _1, _2, httpMethod, _3, httpEndpoint, _4, config, _5, _6, path) => {
        return generator.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
      },
      NodeDefinition: (_1, nodeName, properties, _2, actions) => {
        return generator.NodeDefinition(nodeName, properties, actions)
      },
      LinguisticNodeDefinition: (nodeName, _2, _3, actions) => {
        return generator.NodeDefinition(nodeName, {}, actions)
      },
      Actions: (actions) => {
        return generator.Actions(actions)
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
        return generator.Path(nodeName, channel, path)
      },
      nonemptyListOf: (token, separator, tokens) => {
        return generator.nonemptyListOf(token, separator, tokens)
      },
      LinguisticPath: (nodeName, channel, path) => {
        return generator.Path(nodeName, channel, path)
      },
      LinguisticPathSeparator: (_, channel) => {
        // @TODO
      },
      Import: (_1, _2, fileName, _3, extension) => {
        return generator.Import(fileName, extension)
      },
      Nodes: (node) => {
        return generator.Nodes(node)
      },
      LinguisticNodes: (node) => {
        return generator.Nodes(node)
      },
      Milestone: (nodeName, _) => {
        return generator.Milestone(nodeName)
      },
      LinguisticMilestone: (nodeName, _) => {
        return generator.Milestone(nodeName)
      },
      Node: (node) => {
        return generator.Node(node)
      },
      WaitsFor: (nodeName, _, waitsFor) => {
        return generator.WaitsFor(nodeName, waitsFor)
      },
      NodeBase: (node) => {
        return generator.NodeBase(node)
      },
      SilentNode: (nodeName, _) => {
        return generator.SilentNode(nodeName)
      },
      IdentityNode: (nodeName, _, aliasLabel) => {
        return generator.IdentityNode(nodeName, aliasLabel)
      },
      StandardNode: (nodeName) => {
        return generator.StandardNode(nodeName)
      },
      LinguisticNode: (node) => {
        return generator.Node(node)
      },
      LinguisticWaitsFor: (nodeName, _, alias) => {
        return generator.WaitsFor(nodeName, alias)
      },
      LinguisticNodeBase: (node) => {
        return generator.NodeBase(node)
      },
      LinguisticSilentNode: (_, nodeName) => {
        return generator.SilentNode(nodeName)
      },
      LinguisticIdentityNode: (nodeName, _1, aliasLabel, _2) => {
        return generator.IdentityNode(nodeName, aliasLabel)
      },
      LinguisticStandardNode: (nodeName) => {
        return generator.StandardNode(nodeName)
      },
      Concept: (words) => {
        return generator.Concept(words)
      },
      Channel: (channel) => {
        return generator.Channel(channel)
      },
      ErrorChannel: (_1, channelName, properties, _2) => {
        return generator.ErrorChannel(channelName, properties)
      },
      PlainChannel: (_1, properties, _2) => {
        return generator.PlainChannel(properties)
      },
      NamedChannel: (_1, channelName, properties, _2) => {
        return generator.NamedChannel(channelName, properties)
      },
      LinguisticChannel: (channel) => {
        return generator.Channel(channel)
      },
      LinguisticErrorChannel: (_1, channelName, properties, _2) => {
        return generator.ErrorChannel(channelName, properties)
      },
      LinguisticPlainChannel: (_1, properties, _2) => {
        return generator.PlainChannel(properties)
      },
      LinguisticNamedChannel: (_1, channelName, properties, _2) => {
        return generator.NamedChannel(channelName, properties)
      },
      Properties: (_1, properties, _2) => {
        return generator.Properties(properties)
      },
      Property: (key, _, value) => {
        return generator.Property(key, value)
      },
      HttpMethods: (method) => {
        return generator.HttpMethods(method)
      },
      label: (label) => {
        return generator.label(label)
      },
      string: (_1, string, _2) => {
        return generator.string(string)
      },
      number: (whole, dot, decimal) => {
        return generator.number(whole, dot, decimal)
      },
      space: (space) => {
        return generator.space(space)
      },
      comment: (_1, comments, _2) => {
        return generator.comment(comments)
      }
    })
  }

  /**
   * [getMatches description]
   * @param  {[type]} content [description]
   * @return {[type]}         [description]
   */
  getMatches (content) {
    return this.grammar.match(content)
  }
}

export { Semantics as default }
