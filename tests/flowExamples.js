import StandardChannel from '../src/channels/standardChannel'
import StandardNode from '../src/nodes/standardNode'
import ErrorChannel from '../src/channels/errorChannel'
import Flow from '../src/flow'
import Application from '../src/application'

const test = require('ava')
const Action = require('../src/action')
const CyclicalError = require('../src/errors/cyclicalError')

/**
 * [createApp description]
 * @return {[type]} [description]
 */
function createApp () {
  const app = new Application(undefined, 'Test App', {
    logLevel: 2
  })

  const doubleXAction = new Action(app, undefined, 'doubleX', function doubleX () {
    this.set('x', this.get('x') * 2)
  })
  const halveXAction = new Action(app, undefined, 'halveX', function halveX () {
    this.set('x', this.get('x') / 2)
  })
  const addXAndYAction = new Action(app, undefined, 'addXAndY', function addXAndY () {
    this.set('x', this.get('x') + this.get('y'))
  })
  const subtractXFromYAction = new Action(app, undefined, 'subtractXFromY', function subtractXFromY () {
    this.set('y', this.get('x') - this.get('y'))
  })
  const throwError = new Action(app, undefined, 'throwError', function throwError () {
    this.set('e', this.get('e') + 1)
    throw new Error('We break here')
  })
  const retryOnce = new Action(app, undefined, 'retryOnce', function retryOnce () {
    this.set('retried', this.get('retried', 0) + 1)
    return 1
  })
  const getOneSecondRetryDelay = new Action(app, undefined, 'getOneSecondRetryDelay', function retryOnce () {
    return 1000
  })
  const setXYToOne = new Action(app, undefined, 'setXYToOne', function setXYToOne () {
    this.set('x', 1)
    this.set('y', 1)
  })
  const delayTwentyMilliseconds = new Action(app, undefined, 'delayTwentyMilliseconds', function delayTwentyMilliseconds () {
    return new Promise(resolve => setTimeout(() => {
      this.set('y', this.get('y') * 10)
      resolve()
    }, 20))
  })
  const waitForDelay = new Action(app, undefined, 'waitForDelay', function waitForDelay () {
    return this.waitFor(this.get('waitForDelayId'))
  })

  app.registerAction(doubleXAction.name, doubleXAction)
  app.registerAction(halveXAction.name, halveXAction)
  app.registerAction(addXAndYAction.name, addXAndYAction)
  app.registerAction(subtractXFromYAction.name, subtractXFromYAction)
  app.registerAction(setXYToOne.name, setXYToOne)
  app.registerAction(throwError.name, throwError)
  app.registerAction(retryOnce.name, retryOnce)
  app.registerAction(getOneSecondRetryDelay.name, getOneSecondRetryDelay)
  app.registerAction(delayTwentyMilliseconds.name, delayTwentyMilliseconds)
  app.registerAction(waitForDelay.name, waitForDelay)

  return app
}

test('Basic math flow', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const halveXNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('halveX') ])
  const channelC = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(halveXNode)
  halveXNode.connect(channelC)
  channelC.connect(subtractXFromYNode)

  const result = await app.request('GET', '/testFlow', {
    x: 2,
    y: 10
  })

  t.is(result.x, 7)
  t.is(result.y, -3)
})

test('Basic math flow with unreachable error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const halveXNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('halveX') ])
  const errorChannel = new ErrorChannel(app, undefined, 'Error', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(halveXNode)
  halveXNode.connect(errorChannel)
  errorChannel.connect(subtractXFromYNode)

  const result = await app.request('GET', '/testFlow', {
    x: 2,
    y: 10
  })

  t.is(result.x, 7)
  t.is(result.y, 10)
})

test('Basic math flow with reachable error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel A', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel B', undefined, [], undefined, undefined, [])
  const throwError = new StandardNode(app, undefined, 'Throw Error', [], [], [ app.getAction('throwError') ])
  const errorChannel = new ErrorChannel(app, undefined, 'Error Channel', undefined, [], undefined, undefined, [])
  const setXYToOne = new StandardNode(app, undefined, 'Set X and Y to One', [], [], [ app.getAction('setXYToOne') ])
  const channelC = new StandardChannel(app, undefined, 'Channel C', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(throwError)
  throwError.connect(channelC)
  throwError.connect(errorChannel)
  channelC.connect(subtractXFromYNode)
  errorChannel.connect(setXYToOne)

  const result = await app.request('GET', '/testFlow', {
    e: 0,
    x: 2,
    y: 10
  })

  t.is(result.e, 1)
  t.is(result.x, 1)
  t.is(result.y, 1)
})

test('Basic math flow with retries error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel A', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel B', undefined, [], 3 /* retry count */, undefined, [])
  const throwError = new StandardNode(app, undefined, 'Throw Error', [], [], [ app.getAction('throwError') ])
  const errorChannel = new ErrorChannel(app, undefined, 'Error Channel', undefined, [], undefined, undefined, [])
  const setXYToOne = new StandardNode(app, undefined, 'Set X and Y to One', [], [], [ app.getAction('setXYToOne') ])
  const channelC = new StandardChannel(app, undefined, 'Channel C', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(throwError)
  throwError.connect(channelC)
  throwError.connect(errorChannel)
  channelC.connect(subtractXFromYNode)
  errorChannel.connect(setXYToOne)

  const result = await app.request('GET', '/testFlow', {
    e: 0,
    x: 2,
    y: 10
  })

  t.is(result.e, 1)
  t.is(result.x, 1)
  t.is(result.y, 1)
})

test('Basic math flow with custom retries error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel A', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel B', undefined, [], 'retryOnce', undefined, [])
  const throwError = new StandardNode(app, undefined, 'Throw Error', [], [], [ app.getAction('throwError') ])
  const errorChannel = new ErrorChannel(app, undefined, 'Error Channel', undefined, [], undefined, undefined, [])
  const setXYToOne = new StandardNode(app, undefined, 'Set X and Y to One', [], [], [ app.getAction('setXYToOne') ])
  const channelC = new StandardChannel(app, undefined, 'Channel C', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(throwError)
  throwError.connect(channelC)
  throwError.connect(errorChannel)
  channelC.connect(subtractXFromYNode)
  errorChannel.connect(setXYToOne)

  const result = await app.request('GET', '/testFlow', {
    e: 0,
    x: 2,
    y: 10
  })

  t.is(result.retried, 1)
  t.is(result.e, 1)
  t.is(result.x, 1)
  t.is(result.y, 1)
})

test('Basic math flow with custom retries error with a 1 second delay', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel A', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel B', undefined, [], 'retryOnce', 'getOneSecondRetryDelay', [])
  const throwError = new StandardNode(app, undefined, 'Throw Error', [], [], [ app.getAction('throwError') ])
  const errorChannel = new ErrorChannel(app, undefined, 'Error Channel', undefined, [], undefined, undefined, [])
  const setXYToOne = new StandardNode(app, undefined, 'Set X and Y to One', [], [], [ app.getAction('setXYToOne') ])
  const channelC = new StandardChannel(app, undefined, 'Channel C', undefined, [], undefined, undefined, [])
  const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(throwError)
  throwError.connect(channelC)
  throwError.connect(errorChannel)
  channelC.connect(subtractXFromYNode)
  errorChannel.connect(setXYToOne)

  const result = await app.request('GET', '/testFlow', {
    e: 0,
    x: 2,
    y: 10
  })

  t.is(result.retried, 1)
  t.is(result.e, 1)
  t.is(result.x, 1)
  t.is(result.y, 1)
})

test('Self-referential flow to trigger cyclical error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel A', undefined, [], undefined, undefined, [])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelA)
  channelA.connect(doubleXNode)

  try {
    await app.request('GET', '/testFlow', {
      e: 0,
      x: 2,
      y: 10
    })
    t.fail()
  } catch (error) {
    if (error instanceof CyclicalError) {
      t.pass()
    } else {
      t.fail()
    }
  }
})

test.skip('Flow with waitFor', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.setPublicFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const halveXNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('halveX') ])
  const channelC = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const channelD = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const delay = new StandardNode(app, undefined, 'delayTwentyMilliseconds', [], [], [ app.getAction('delayTwentyMilliseconds') ])
  const wait = new StandardNode(app, undefined, 'waitForDelay', [], [], [ app.getAction('waitForDelay') ])

  flow.connect(doubleXNode)
  doubleXNode.connect(channelD)
  channelD.connect(delay)

  doubleXNode.connect(channelA)
  channelA.connect(addXAndYNode)
  addXAndYNode.connect(channelB)
  channelB.connect(halveXNode)
  halveXNode.connect(channelC)
  channelC.connect(wait)

  const result = await app.request('GET', '/testFlow', {
    waitForDelayId: delay.id,
    x: 2,
    y: 10
  })

  t.is(result.x, 7)
  t.is(result.y, 100)
})
