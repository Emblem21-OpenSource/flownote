import Channel from '../src/channel'
import Node from '../src/node'
import Flow from '../src/flow'
import Application from '../src/application'
import Event from '../src/event'

const test = require('ava')
const Action = require('../src/action')
const Request = require('../src/request')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Event', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)

  t.is(typeof event.id, 'string')
  t.is(event.type, 'event')
  t.is(event.request, undefined)
  t.is(event.from, node1)
})

test('Event.asFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)

  const flattened = event.asFlattened()

  t.regex(flattened, /{"id":"1","from":"2","type":"3"/)
})

test('Event.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)

  const flattened = event.asFlattened()

  t.regex(flattened, /{"id":"1","from":"2","type":"3"/)
})

test('Event.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)

  const flattened = event.asFlattened()
  const restoredEvent = new Event(app).loadFlattened(flattened)

  t.is(typeof restoredEvent.id, 'string')
  t.is(restoredEvent.type, 'event')
  t.is(restoredEvent.request, undefined)
  t.is(restoredEvent.from, node1)
})

test('Event.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node1)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)

  const flattened = event.asFlattened()
  const restoredEvent = new Event(app).loadFlattened(flattened)

  t.is(typeof restoredEvent.id, 'string')
  t.is(restoredEvent.type, 'event')
  t.is(restoredEvent.request, undefined)
  t.is(restoredEvent.from, node1)
})

test('Event.attachRequest', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const node1 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])
  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, [])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const event = new Event(app, undefined, 'event', undefined, node1, flow)
  const request = new Request(app, {
    a: 7,
    b: 12
  }, flow, node1)

  event.attachRequest(request)

  t.is(typeof event.id, 'string')
  t.is(event.type, 'event')
  t.is(event.request, request)
  t.is(event.from, node1)
})
