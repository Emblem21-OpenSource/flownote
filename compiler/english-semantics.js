import Generator from './generator'

module.exports = function getSemantics (application) {
  const generator = new Generator(application)

  return {
    Expression: generator.Expression,
    FlowTypes: generator.FlowTypes,
    NodeTypes: generator.NodeTypes,
    PathTypes: generator.PathTypes,
    LinguisticFlowDefinition: (flowName, _1, _2, httpMethod, _3, httpEndpoint, _4, config, _5, _6, path) => {
      return generator.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
    },
    LinguisticNodeDefinition: (nodeName, _2, _3, actions) => {
      return generator.NodeDefinition(nodeName, {}, actions)
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
    NonemptyListOf: generator.NonemptyListOf,
    LinguisticPath: generator.Path,
    LinguisticPathSeparator: (_, channel) => {
      return channel.eval()
    },
    Import: (_1, _2, fileName, _3, extension) => {
      return generator.Import(fileName, extension)
    },
    LinguisticNodes: generator.Nodes,
    LinguisticMilestone: generator.Milestone,
    LinguisticNode: generator.Node,
    LinguisticWaitsFor: (nodeName, _, alias) => {
      return generator.WaitsFor(nodeName, alias)
    },
    LinguisticNodeBase: generator.NodeBase,
    LinguisticSilentNode: (_, nodeName) => {
      return generator.SilentNode(nodeName)
    },
    LinguisticIdentityNode: (nodeName, _1, aliasLabel, _2) => {
      return generator.IdentityNode(nodeName, aliasLabel)
    },
    LinguisticStandardNode: generator.StandardNode,
    Concept: generator.Concept,
    LinguisticChannel: generator.Channel,
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
    HttpMethods: generator.HttpMethods,
    label: generator.label,
    string: (_1, string, _2) => {
      return generator.string(string)
    },
    _terminal: () => { return this.primitiveValue },
    number: generator.number,
    fraction: generator.fraction,
    whole: generator.whole,
    space: generator.space,
    comment: generator.comment,
    multiLineComment: generator.multiLineComment,
    singleLineComment: generator.singleLineComment
  }
}
