import StandardNode from '../src/nodes/standardNode'
import Flow from '../src/flow'
import Action from '../src/action'
import Application from '../src/application'
import ActionContext from '../src/actionContext'

const test = require('ava')
const Request = require('../src/request')

/**
 * [createHarness description]
 * @return {[type]} [description]
 */
function createHarness () {
  const app = new Application(undefined, 'Test App', {
    logLevel: 2,
    silent: true
  })

  const setX = new Action('setX', function waitForDelay () {
    return this.set('x')
  }, app)

  app.registerAction(setX.name, setX)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [])

  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)
  flow.connect(doubleXNode)

  const request = new Request(app, {
    a: 7,
    b: 12
  }, flow, doubleXNode)

  const context = new ActionContext(app, flow, doubleXNode, request)

  return { app, doubleXNode, request, context, setX }
}

test('Define ActionContext', t => {
  const { context } = createHarness()
  t.is(context instanceof ActionContext, true)
})

test('ActionContext Dispatching', t => {
  const { context } = createHarness()
  context.dispatch('Flow.start')
  t.is(context instanceof ActionContext, true)
})

test('ActionContext Set', t => {
  const { context, request } = createHarness()
  context.set('test', 7)
  t.is(request.getState().test, 7)
})

test('ActionContext Get', t => {
  const { context } = createHarness()
  t.is(context.get('b'), 12)
})

test('ActionContext toStore/fromStore', t => {
  const { context } = createHarness()
  context.toStore('testStore', 'someKey', 5)
  t.is(context.fromStore('testStore', 'someKey'), 5)
})

test('ActionContext Schedule', t => {
  const { context, request, setX } = createHarness()
  t.is(request.accumulatedActions.length, 0)

  context.schedule(setX)

  t.is(request.accumulatedActions.length, 1)
  t.is(request.accumulatedActions[0].name, 'setX')
})

test.todo('ActionContext waitFor')
