import Channel from '../src/channel'
import Node from '../src/node'
import Flow from '../src/flow'
import Application from '../src/application'
import Milestone from '../src/milestone'

const test = require('ava')
const Action = require('../src/action')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'
const milestoneName = 'Commit changes'

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Milestone', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  milestone.connect(channel)
  channel.connect(node2)

  t.is(milestone.application, app)
  t.is(milestone.name, milestoneName)
  t.is(milestone.to.length, 1)
  t.is(milestone.to[0], channel)
  t.is(milestone.strategy, 'fcfs')
  t.is(milestone.requestIdHistory.length, 0)
})

test('Milestone.asFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  milestone.connect(channel)
  channel.connect(node2)

  const flattened = milestone.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /,"test",/)
  t.regex(flattened, /"data => {\\r\\n  data\.x \*= 2\\r\\n  return data\\r\\n}"/)
})

test('Milestone.asFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])

  milestone.connect(channel)
  channel.connect(milestone)

  const flattened = milestone.asFlattened()

  t.regex(flattened, /,"Double X",/)
  t.regex(flattened, /","Plain",/)
  t.regex(flattened, /"data => {\\r\\n  data\.x \*= 2\\r\\n  return data\\r\\n}"/)
})

test('Milestone.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  flow.connect(milestone)
  milestone.connect(channel)
  channel.connect(node2)

  const flattened = milestone.asFlattened()
  const restoredMilestone = new Milestone(app).loadFlattened(flattened)

  t.is(restoredMilestone.application, app)
  t.is(restoredMilestone.name, milestoneName)
  t.is(restoredMilestone.to.length, 1)
  t.is(restoredMilestone.to[0].id, channel.id)
  t.is(restoredMilestone.to[0].to.id, node2.id)
  t.is(restoredMilestone.strategy, 'fcfs')
  t.is(restoredMilestone.requestIdHistory.length, 0)
})

test('Milestone.loadFlattened (Circular)', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])

  flow.connect(milestone)
  milestone.connect(channel)
  channel.connect(milestone)

  const flattened = milestone.asFlattened()
  const restoredMilestone = new Milestone(app).loadFlattened(flattened)

  t.is(restoredMilestone.application, app)
  t.is(restoredMilestone.name, milestoneName)
  t.is(restoredMilestone.to.length, 1)
  t.is(restoredMilestone.to[0].id, channel.id)
  t.is(restoredMilestone.to[0].to.id, milestone.id)
  t.is(restoredMilestone.strategy, 'fcfs')
  t.is(restoredMilestone.requestIdHistory.length, 0)
})

test('Milestone.addAction with Action', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  milestone.connect(channel)
  channel.connect(node2)
  milestone.addAction(action)

  t.is(milestone.actions.length, 2)
  t.is(milestone.actions[0].toString(), action.toString())
  t.is(milestone.actions[1].toString(), action.toString())
})

test('Milestone.addAction with String', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  milestone.connect(channel)
  channel.connect(node2)
  milestone.addAction(action.name)

  t.is(milestone.actions.length, 2)
  t.is(milestone.actions[0].toString(), action.toString())
  t.is(milestone.actions[1].toString(), action.toString())
})

test('Milestone.connect', t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow')
  app.setPublicFlow(flow)

  const channel = new Channel(app, undefined, channelName, undefined, [], undefined, undefined, [])
  const action = new Action(app, undefined, nodeName, doubleX)
  app.registerAction(action.name, action)

  const milestone = new Milestone(app, undefined, milestoneName, 'fcfs', [], [ action ])
  const node2 = new Node(app, undefined, nodeName, [], [ 'test' ], [ action ])

  milestone.connect(channel)
  channel.connect(node2)

  t.is(milestone.to.length, 1)
  t.is(milestone.to[0], channel)
  t.is(milestone.to[0].to, node2)
})
