import Application from '../src/application'

const test = require('ava')
const Action = require('../src/action')
const Request = require('../src/request')

const appName = 'Test'

const flow = { id: 'flowId', config: {} }
const node = { id: 'nodeId' }

const doubleX = data => {
  data.x *= 2
  return data
}

test('Define Request', async t => {
  const app = new Application(undefined, appName)
  const request = new Request(app, {
    a: 7,
    b: 12
  }, flow, node)

  t.is(request.changes.length, 2)
  t.is(request.changes[0].appId, app.id)
  t.is(request.changes[0].flowId, 'flowId')
  t.is(request.changes[0].stepId, 'nodeId')
  t.is(request.changes[0].key, 'a')
  t.is(request.changes[0].value, 7)
  t.is(request.changes[1].appId, app.id)
  t.is(request.changes[1].flowId, 'flowId')
  t.is(request.changes[1].stepId, 'nodeId')
  t.is(request.changes[1].key, 'b')
  t.is(request.changes[1].value, 12)
})

test('Request.addChange', async t => {
  const app = new Application(undefined, appName)
  const request = new Request(app, {}, flow, node)

  request.change(app, flow, node, 'a', 7)

  t.is(request.changes.length, 1)
  t.is(request.changes[0].appId, app.id)
  t.is(request.changes[0].flowId, 'flowId')
  t.is(request.changes[0].stepId, 'nodeId')
  t.is(request.changes[0].key, 'a')
  t.is(request.changes[0].value, 7)
})

test('Request.addChange then Request.thenChange', async t => {
  const app = new Application(undefined, appName)
  const request = new Request(app, {}, flow, node)

  request
    .change(app, flow, node, 'a', 7)
    .thenChange('b', 12)

  t.is(request.changes.length, 2)
  t.is(request.changes[0].appId, app.id)
  t.is(request.changes[0].flowId, 'flowId')
  t.is(request.changes[0].stepId, 'nodeId')
  t.is(request.changes[0].key, 'a')
  t.is(request.changes[0].value, 7)
  t.is(request.changes[1].appId, app.id)
  t.is(request.changes[1].flowId, 'flowId')
  t.is(request.changes[1].stepId, 'nodeId')
  t.is(request.changes[1].key, 'b')
  t.is(request.changes[1].value, 12)
})

test('Request.getState', async t => {
  const app = new Application(undefined, appName)
  const request = new Request(app, {}, flow, node)

  request
    .change(app, flow, node, 'a', 7)
    .thenChange('b', 12)
    .thenChange('a', 1)
    .thenChange('b', 2)

  const state = request.getState({
    a: 7,
    b: 99
  })

  t.is(state.a, 1)
  t.is(state.b, 2)
})

test('Request.addAction', async t => {
  const app = new Application(undefined, appName)
  const request = new Request(app, {}, flow, node)
  const action = new Action(app, undefined, 'Double X', doubleX)

  request.addAction(action)
  t.is(request.accumulatedActions.length, 1)
  t.is(request.accumulatedActions[0].application, app)
  t.is(request.accumulatedActions[0].name, 'Double X')
  t.is(request.accumulatedActions[0].method, doubleX)
})
