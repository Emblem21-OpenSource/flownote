import Application from '../src/application'
import ActionContext from '../src/actionContext'
import Node from '../src/node'
import Flow from '../src/flow'
import Action from '../src/action'

const test = require('ava')
const Request = require('../src/request')

function doubleX () {
  this.set('x', this.get('x') * 2)
}

const appName = 'Test'
const actionName = 'Double X'

test('Define action', t => {
  const app = new Application(undefined, appName)
  const action = new Action(app, undefined, actionName, doubleX)
  t.is(action.name, actionName)
})

test('Action.asFlattened', t => {
  const app = new Application(undefined, appName)
  const action = new Action(app, undefined, actionName, doubleX)
  t.regex(action.asFlattened(), /,"Double X","function doubleX()/)
})

test('Action.loadFlattened', t => {
  const app = new Application(undefined, appName)
  const action = new Action(app, undefined, actionName, doubleX)
  const flattened = action.asFlattened()
  const action2 = new Action(app).loadFlattened(flattened)

  t.is(action.application, action2.application)
  t.is(action.id, action2.id)
  t.is(action.name, action2.name)
  t.is(action.method.toString(), action2.method.toString())
})

test('Action.execute', async t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow', {}, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const node = new Node(app, undefined, 'Double X', [], [], [])
  flow.connect(node)

  const action = new Action(app, undefined, actionName, doubleX)
  const request = new Request(app, {
    x: 7
  }, flow, node)
  const actionContext = new ActionContext(app, flow, node, request)
  await action.execute(actionContext)
  t.is(request.getState().x, 14)
})

test('Action.execute after JSON', async t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow', {}, undefined, 'GET', '/testFlow', [])
  app.setPublicFlow(flow)

  const node = new Node(app, undefined, 'Double X', [], [], [])
  flow.connect(node)

  const action = new Action(app, undefined, actionName, doubleX)

  const flattened = action.asFlattened()
  const action2 = new Action(app).loadFlattened(flattened)

  const request = new Request(app, {
    x: 7
  }, flow, node)

  const actionContext = new ActionContext(app, flow, node, request)

  await action2.execute(actionContext)
  t.is(request.getState().x, 14)
})
