import Generator from './generator'

module.exports = function getSemantics (application) {
  const generator = new Generator(application)

  return {
    Expression: generator.Expression,
    FlowTypes: generator.FlowTypes,
    NodeTypes: generator.NodeTypes,
    PathTypes: generator.PathTypes,
    FlowDefinition: (_1, flowName, _2, httpMethod, _3, httpEndpoint, _4, config, _5, path) => {
      return generator.FlowDefinition(flowName, httpMethod, httpEndpoint, config, path)
    },
    NodeDefinition: (_1, nodeName, properties, _2, actions) => {
      return generator.NodeDefinition(nodeName, properties, actions)
    },
    Actions: (actions) => {
      return generator.Actions(actions)
    },
    Path: (nodeName, channel, path) => {
      return generator.Path(nodeName, channel, path)
    },
    NonemptyListOf: (token, separator, tokens) => {
      return generator.NonemptyListOf(token, separator, tokens)
    },
    EmptyListOf: () => {
      return []
    },
    Import: (_1, _2, fileName, _3, extension, _4) => {
      return generator.Import(fileName, extension)
    },
    Nodes: (node) => {
      return generator.Nodes(node)
    },
    Milestone: (node, _1) => {
      return generator.Milestone(node)
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
    SilentNode: (node, _) => {
      return generator.SilentNode(node)
    },
    IdentityNode: (nodeName, _, aliasLabel) => {
      return generator.IdentityNode(nodeName, aliasLabel)
    },
    StandardNode: (nodeName) => {
      return generator.StandardNode(nodeName)
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
    _terminal: () => {
      return this.primitiveValue
    },
    alnum: (value) => {
      return value.sourceString
    },
    digit: (value) => {
      return value.sourceString
    },
    number: (number) => {
      return generator.number(number)
    },
    fraction: (whole, dot, decimal) => {
      return generator.fraction(whole, dot, decimal)
    },
    whole: (number) => {
      return generator.whole(number)
    },
    space: (space) => {
      return generator.space(space)
    },
    comment: (comments) => {
      return generator.comment(comments)
    },
    multiLineComment: (_1, comments, _2) => {
      return generator.multiLineComment(comments)
    },
    singleLineComment: (_1, comments) => {
      return generator.singleLineComment(_1, comments)
    }
  }
}
