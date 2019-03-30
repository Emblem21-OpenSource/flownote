import Channel from '../src/channel'
import Node from '../src/node'
import Flow from '../src/flow'
import Application from '../src/application'

const test = require('ava')
const Action = require('../src/action')

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

test('Define Application', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  t.is(typeof app.id, 'string')
  t.is(app.name, appName)
  t.deepEqual(app.config, {
    a: 7,
    logLevel: 2,
    silent: true
  })
  t.is(app.publicFlow, flow)
  t.is(app.flows.length, 1)
  t.is(app.flows[0], flow)
  t.is(app.actions.size, 1)
  t.is(app.actions.get(action.name), action)
})

test('Application.asFlattened', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)
  const flattened = app.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\r\\n  data\.x \*= 2\\r\\n  return data\\r\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Application.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = app.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /"data => {\\r\\n  data\.x \*= 2\\r\\n  return data\\r\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Application.loadFlattened', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)
  const flattened = app.asFlattened()
  const restoredApp = new Application().loadFlattened(flattened)

  t.is(typeof restoredApp.id, 'string')
  t.is(restoredApp.name, appName)
  t.deepEqual(restoredApp.config, {
    a: 7,
    logLevel: 2,
    silent: true
  })
  t.is(restoredApp.publicFlow.id, flow.id)
  t.is(restoredApp.flows.length, 1)
  t.is(restoredApp.flows[0].id, flow.id)
  t.is(restoredApp.flows[0].to.id, node1.id)
  t.is(restoredApp.actions.size, 1)
  t.is(restoredApp.actions.get(action.name).id, action.id)
})

test('Application.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = flow.asFlattened()
  const restoredFlow = new Flow(app).loadFlattened(flattened)

  t.is(restoredFlow.application, app)
  t.is(restoredFlow.name, flowName)
  t.deepEqual(restoredFlow.config, config)
  t.is(restoredFlow.to.id, node1.id)
  t.is(restoredFlow.to.to.length, 1)
  t.is(restoredFlow.to.to[0].id, channel.id)
  t.is(restoredFlow.to.to[0].to.id, node1.id)
  t.is(restoredFlow.endpointMethod, 'GET')
  t.is(restoredFlow.endpointRoute, '/testFlow')
  t.is(restoredFlow.endpointParams.length, 0)
})

test('Application.connect', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  t.is(app.publicFlow, flow)
  t.is(app.publicFlow.to.id, node1.id)
  t.is(app.publicFlow.to.to.length, 1)
  t.is(app.publicFlow.to.to[0].id, channel.id)
  t.is(app.publicFlow.to.to[0].to.id, node2.id)
  t.is(app.flows.length, 1)
  t.is(app.flows[0], flow)
  t.is(app.flows[0].to.id, node1.id)
  t.is(app.flows[0].to.to.length, 1)
  t.is(app.flows[0].to.to[0].id, channel.id)
  t.is(app.flows[0].to.to[0].to.id, node2.id)
})

test('Application.setConfig', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  app.setConfig('test', 7)

  t.is(app.getConfig('test'), 7)
})

test('Application.getConfig', t => {
  const app = new Application(undefined, appName, {
    test: 7
  }, undefined, [])
  t.is(app.getConfig('test'), 7)
})

test('Application.setPublicFlow', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])

  t.is(app.publicFlow, undefined)

  app.setPublicFlow(flow)

  t.is(app.publicFlow, flow)
})

test('Application.registerAction and Application.getAction', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)
  t.is(app.getAction(action.name), action)
})

test('Application.registerFlow', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])

  app.registerFlow(flow)

  t.is(app.flows.length, 1)
  t.is(app.flows[0], flow)
})

test('Application.getFlow by name', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])

  app.registerFlow(flow)

  t.is(app.getFlow(flow.name), flow)
})

test('Application.getFlow by id', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])

  app.registerFlow(flow)

  t.is(app.getFlow(flow.id), flow)
})

test('Application.getUniqueId', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  t.is(app.getUniqueId().length > 1, true)
})
