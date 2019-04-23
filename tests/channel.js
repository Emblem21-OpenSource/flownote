import Channel from '../src/channel'
import Node from '../src/node'
import Flow from '../src/flow'
import Application from '../src/application'
import Action from '../src/action'

const test = require('ava')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Channel', t => {
  const app = new Application(undefined, appName)
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)
  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node2)

  t.is(channel.application, app)
  t.is(channel.name, channelName)
  t.is(channel.to, node2)
  t.is(channel.accepts.length, 0)
  t.is(channel.retry, undefined)
  t.is(channel.actions.length, 0)
})

test('Channel.asFlattened', t => {
  const app = new Application(undefined, appName)
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)
  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node2)
  const flattened = node1.asFlattened()

  t.regex(flattened, /,"Double X",\["7"\],\["8"\],\["9"\]/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
})

test('Channel.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)
  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node1)
  const flattened = node1.asFlattened()

  t.regex(flattened, /,"Double X",\["7"\],\["8"\],\["9"\]/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
})

test('Channel.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const flattened = node1.asFlattened()
  const restoredNode = new Node(app).loadFlattened(flattened)

  t.is(restoredNode.application, app)
  t.is(restoredNode.name, nodeName)
  t.is(restoredNode.to.length, 1)
  t.is(restoredNode.to[0].name, channelName)
  t.is(restoredNode.to[0].application, app)
  t.is(restoredNode.to[0].accepts.length, 0)
  t.is(restoredNode.to[0].retry, undefined)
  t.is(restoredNode.to[0].actions.length, 0)
  t.is(restoredNode.to[0].to.name, nodeName)
  t.is(restoredNode.to[0].to.application, app)
})

test('Channel.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)

  const flattened = node1.asFlattened()
  const restoredNode = new Node(app).loadFlattened(flattened)

  t.is(restoredNode.application, app)
  t.is(restoredNode.name, nodeName)
  t.is(restoredNode.to.length, 1)
  t.is(restoredNode.to[0].name, channelName)
  t.is(restoredNode.to[0].application, app)
  t.is(restoredNode.to[0].accepts.length, 0)
  t.is(restoredNode.to[0].retry, undefined)
  t.is(restoredNode.to[0].actions.length, 0)
  t.is(restoredNode.to[0].to.name, nodeName)
  t.is(restoredNode.to[0].to.application, app)
})

test('Channel.addAction with Action', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)
  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node2)
  channel.addAction(action)

  t.is(channel.actions.length, 1)
  t.is(channel.actions[0].toString(), action.toString())
})

test('Channel.addAction with String', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node2)
  channel.addAction(action.name)

  t.is(channel.actions.length, 1)
  t.is(channel.actions[0].toString(), action.toString())
})

test('Channel.connect', t => {
  const app = new Application(undefined, appName)
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  node1.connect(channel)
  channel.connect(node2)

  t.is(node1.to.length, 1)
  t.is(channel.to, node2)
})
