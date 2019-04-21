import Channel from '../src/channel'
import Node from '../src/node'
import Application from '../src/application'
import Flow from '../src/flow'
import Action from '../src/action'

const test = require('ava')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'
const flowName = 'Plain'
const config = {
  a: 7
}

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Flow', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  t.is(flow.application, app)
  t.is(flow.name, flowName)
  t.deepEqual(flow.config, config)
  t.is(flow.to, node1)
  t.is(flow.endpointMethod, 'GET')
  t.is(flow.endpointRoute, '/testFlow')
  t.is(flow.endpointParams.length, 0)
})

test('Define Flow with constructor-attached node', t => {
  const app = new Application(undefined, appName)

  const action = new Action(app, undefined, nodeName, doubleX)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  node1.connect(channel)
  channel.connect(node2)

  const flow = new Flow(app, undefined, flowName, config, node1, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  t.is(flow.application, app)
  t.is(flow.name, flowName)
  t.deepEqual(flow.config, config)
  t.is(flow.to, node1)
  t.is(flow.endpointMethod, 'GET')
  t.is(flow.endpointRoute, '/testFlow')
  t.is(flow.endpointParams.length, 0)
})

test('Flow.asFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)
  const flattened = flow.asFlattened()

  t.regex(flattened, /,"Double X",\["14"\],\["15"\],\["16"\]/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Flow.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = flow.asFlattened()

  t.regex(flattened, /,"Double X",\["14"\],\["15"\],\["16"\]/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Flow.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)
  const flattened = flow.asFlattened()
  const restoredFlow = new Flow(app).loadFlattened(flattened)

  t.is(restoredFlow.application, app)
  t.is(restoredFlow.name, flowName)
  t.deepEqual(restoredFlow.config, config)
  t.is(restoredFlow.to.id, node1.id)
  t.is(restoredFlow.endpointMethod, 'GET')
  t.is(restoredFlow.endpointRoute, '/testFlow')
  t.is(restoredFlow.endpointParams.length, 0)
})

test('Flow.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = flow.asFlattened()
  const restoredFlow = new Flow(app).loadFlattened(flattened)

  t.is(restoredFlow.application, app)
  t.is(restoredFlow.name, flowName)
  t.deepEqual(restoredFlow.config, config)
  t.is(restoredFlow.to, node1)
  t.is(restoredFlow.endpointMethod, 'GET')
  t.is(restoredFlow.endpointRoute, '/testFlow')
  t.is(restoredFlow.endpointParams.length, 0)
})

test('Flow.connect', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  t.is(flow.to, node1)
  t.is(flow.to.to.length, 1)
  t.is(flow.to.to[0], channel)
  t.is(flow.to.to[0].to, node2)
})
