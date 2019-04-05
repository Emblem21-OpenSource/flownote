import Channel from '../src/channel'
import Node from '../src/node'
import Application from '../src/application'
import Flow from '../src/flow'

const test = require('ava')
const Action = require('../src/action')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Node', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])

  t.is(node.application, app)
  t.is(node.name, nodeName)
  t.is(node.to.length, 1)
  t.is(node.to[0], to)
  t.is(node.tags.length, 1)
  t.is(node.tags[0], 'test')
  t.is(node.actions.length, 1)
  t.is(node.actions[0], action)
})

test('Node.asFlattened', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])
  const flattened = node.asFlattened()

  t.regex(flattened, /,"Double X",\["6"\],\["7"\],\["8"\]/)
  t.regex(flattened, /","Plain",\[\],\[\]/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"\]/)
})

test('Node.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])
  to.connect(node)
  const flattened = node.asFlattened()

  t.regex(flattened, /,"Double X",\["6"\],\["7"\],\["8"\]/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"\]/)
})

test('Node.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])
  const flattened = node.asFlattened()
  const node2 = new Node(app).loadFlattened(flattened)

  t.is(node2.application, app)
  t.is(node2.name, nodeName)
  t.is(node2.to.length, 1)
  t.deepEqual(node2.to[0], to)
  t.is(node2.tags.length, 1)
  t.is(node2.tags[0], 'test')
  t.is(node2.actions.length, 1)
  t.is(node2.actions[0].toString(), action.toString())
})

test('Node.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName, {})
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])

  flow.connect(node)
  to.connect(node)

  const flattened = node.asFlattened()
  const node2 = new Node(app).loadFlattened(flattened)

  t.is(node2.application, app)
  t.is(node2.name, nodeName)
  t.is(node2.to.length, 1)
  t.deepEqual(node2.to[0], to)
  t.is(node2.tags.length, 1)
  t.is(node2.tags[0], 'test')
  t.is(node2.actions.length, 1)
  t.is(node2.actions[0].toString(), action.toString())
})

test('Node.addAction with Action', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])
  node.addAction(action)

  t.is(node.actions.length, 2)
  t.is(node.actions[0].toString(), action.toString())
  t.is(node.actions[1].toString(), action.toString())
})

test('Node.addAction with String', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])

  node.addAction(action.name)

  t.is(node.actions.length, 2)
  t.is(node.actions[0].toString(), action.toString())
  t.is(node.actions[1].toString(), action.toString())
})

test('Node.connect', t => {
  const app = new Application(undefined, appName)
  const to = new Channel(app, undefined, channelName)
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node = new Node(app, undefined, nodeName, [ to ], [ 'test' ], [ action ])
  node.connect(to)

  t.is(node.to.length, 2)
  t.is(node.to[0], to)
  t.is(node.to[1], to)
})
