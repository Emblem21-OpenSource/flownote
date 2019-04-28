import Channel from '../src/channel'
import Node from '../src/node'
import Flow from '../src/flow'
import Application from '../src/application'
import Action from '../src/action'

const test = require('ava')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'
const flowName = 'Plain'
const config = {
  a: 7
}

const doubleX = function (data) {
  data.x *= 2
  return data
}

test('Define Application', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

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
  t.is(app.flows.length, 1)
  t.is(app.flows[0], flow)
  t.is(app.actions.size, 1)
  t.is(app.actions.get(action.name), action)
})

test('Application.asFlattened', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)
  const flattened = app.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /{\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Application.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = app.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /},"test",{/)
  t.regex(flattened, /{\\?r?\\n  data\.x \*= 2\\?r?\\n  return data\\?r?\\n}"/)
  t.regex(flattened, /,"GET","\/testFlow",\[\]/)
})

test('Application.loadFlattened', t => {
  function actionGenerator (require) {
    const { Action } = require('../src/index')

    return [
      new Action('Double X', function (data) {
        data.x *= 2
        return data
      })
    ]
  }

  const action = actionGenerator.call(this, require)[0]

  const app = new Application(undefined, appName, config, undefined, [], [ actionGenerator ])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

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

  t.is(restoredApp.flows.length, 1)
  t.is(restoredApp.flows[0].id, flow.id)
  t.is(restoredApp.flows[0].to.id, node1.id)
  t.is(restoredApp.actionGenerators.length, 1)
  t.is(restoredApp.actions.size, 1)
  t.is(restoredApp.actions.get(action.name).name, action.name)
})

test('Application.loadFlattened (Circular)', t => {
  function actionGenerator (require) {
    const { Action } = require('../src/index')

    return [
      new Action('Double X', function (data) {
        data.x *= 2
        return data
      })
    ]
  }

  const action = actionGenerator.call(this, require)[0]

  const app = new Application(undefined, appName, config, undefined, [], [ actionGenerator ])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)
  const flattened = app.asFlattened()
  const restoredApp = new Application().loadFlattened(flattened)

  t.is(typeof restoredApp.id, 'string')
  t.is(restoredApp.name, appName)
  t.deepEqual(restoredApp.config, {
    a: 7,
    logLevel: 2,
    silent: true
  })
  t.is(restoredApp.flows.length, 1)
  t.is(restoredApp.flows[0].id, flow.id)
  t.is(restoredApp.flows[0].to.id, node1.id)
  t.is(restoredApp.actionGenerators.length, 1)
  t.is(restoredApp.actions.size, 1)
  t.is(restoredApp.actions.get(action.name).name, action.name)
})

test('Application.connect', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const flow = new Flow(app, undefined, flowName, config, undefined, 'GET', '/testFlow', [])
  app.registerFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

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

test('Application.registerAction and Application.getAction', t => {
  const app = new Application(undefined, appName, config, undefined, [])
  const action = new Action(nodeName, doubleX, app)
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
