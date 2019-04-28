import StandardChannel from '../src/channels/standardChannel'
import StandardNode from '../src/nodes/standardNode'
import ErrorChannel from '../src/channels/errorChannel'
import Flow from '../src/flow'
import Application from '../src/application'
import Compiler from '../compiler/index'
import Action from '../src/action'

const test = require('ava')
const CyclicalError = require('../src/errors/cyclicalError')

const logLevel = 2
const silent = true

/**
 * [createApp description]
 * @return {[type]} [description]
 */
function createApp () {
  const app = new Application(undefined, 'Test App', {
    logLevel,
    silent
  })

  const doubleXAction = new Action('doubleX', function doubleX () {
    this.set('x', this.get('x') * 2)
  }, app)
  const halveXAction = new Action('halveX', function halveX () {
    this.set('x', this.get('x') / 2)
  }, app)
  const addXAndYAction = new Action('addXAndY', function addXAndY () {
    this.set('x', this.get('x') + this.get('y'))
  }, app)
  const subtractXFromYAction = new Action('subtractXFromY', function subtractXFromY () {
    this.set('y', this.get('x') - this.get('y'))
  }, app)
  const throwError = new Action('throwError', function throwError () {
    this.set('e', this.get('e') + 1)
    throw new Error('We break here')
  }, app)
  const retryOnce = new Action('retryOnce', function retryOnce () {
    this.set('retried', this.get('retried', 0) + 1)
    return 1
  }, app)
  const getOneSecondRetryDelay = new Action('getOneSecondRetryDelay', function retryOnce () {
    return 1000
  }, app)
  const setXYToOne = new Action('setXYToOne', function setXYToOne () {
    this.set('x', 1)
    this.set('y', 1)
  }, app)
  const delayTwentyMilliseconds = new Action('delayTwentyMilliseconds', function delayTwentyMilliseconds () {
    return new Promise(resolve => setTimeout(() => {
      this.set('y', this.get('y') * 10)
      resolve()
    }, 1000))
  }, app)
  const waitForDelay = new Action('waitForDelay', function waitForDelay () {
    return this.waitFor(this.get('waitForDelayId'))
  }, app)

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
  app.registerFlow(flow)

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

  t.is(result.state.x, 7)
  t.is(result.state.y, -3)
})

test('Basic math flow showing result state, changes, and trace', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {
    showTrace: true,
    showChanges: true,
    showState: true
  }, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.x, 7)
  t.is(result.state.y, -3)
  t.is(result.changes.length, 6)
  t.is(result.changes[0].key, 'x')
  t.is(result.changes[0].value, 2)
  t.is(result.changes[1].key, 'y')
  t.is(result.changes[1].value, 10)
  t.is(result.changes[2].key, 'x')
  t.is(result.changes[2].value, 4)
  t.is(result.changes[3].key, 'x')
  t.is(result.changes[3].value, 14)
  t.is(result.changes[4].key, 'x')
  t.is(result.changes[4].value, 7)
  t.is(result.changes[5].key, 'y')
  t.is(result.changes[5].value, -3)
  t.is(result.trace.length, 6)
})

test('Basic math flow with unreachable error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.x, 7)
  t.is(result.state.y, 10)
})

test('Basic math flow with reachable error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.e, 1)
  t.is(result.state.x, 1)
  t.is(result.state.y, 1)
})

test('Basic math flow with retries error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.e, 1)
  t.is(result.state.x, 1)
  t.is(result.state.y, 1)
})

test('Basic math flow with custom retries error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.retried, 1)
  t.is(result.state.e, 1)
  t.is(result.state.x, 1)
  t.is(result.state.y, 1)
})

test('Basic math flow with custom retries error with a 1 second delay', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

  t.is(result.state.retried, 1)
  t.is(result.state.e, 1)
  t.is(result.state.x, 1)
  t.is(result.state.y, 1)
})

test('Self-referential flow to trigger cyclical error', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

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

test('Compiling a FlowNote into an Application', async t => {
  function actionGenerator () {
    const { Action } = require('../src/index')

    return [
      new Action('extractClickData', function extractClickData () {
        this.set('click', this.get('click'))
      }),
      new Action('extractPlayerId', function extractPlayerId () {
        this.set('playerId', this.get('playerId'))
      }),
      new Action('getXYCoordsFromClickData', function getXYCoordsFromClickData () {
        this.set('clickX', this.get('click').x)
        this.set('clickY', this.get('click').y)
        this.dispatch('Coordinates')
      }),
      new Action('getPlayerById', function getPlayerById () {
        this.set('player', {
          id: this.get('playerId'),
          name: 'Alice',
          x: 10,
          y: 12
        })
      }),
      new Action('detectPlayerMovementEvents', function detectPlayerMovementEvents () {
        (this.get('events') || []).forEach(event => {
          if (event.type === 'move') {
            this.set('pendingMove', event)
          }
        })
      }),
      new Action('movePlayer', function movePlayer () {
        const player = this.get('player')
        player.x += this.get('clickX')
        player.y += this.get('clickY')
      }),
      new Action('dispatchPlayerMovementEvents', function dispatchPlayerMovementEvents () {
        this.dispatch('playerMoved')
      }),
      new Action('sendBoundaryError', function sendBoundaryError () {
        this.dispatch('BoundaryError')
      }),
      new Action('getBroadcastMessage', function getBroadcastMessage () {
        this.set('broadcastMessage', 'Player Moved')
      }),
      new Action('getRoomByPlayerId', function getRoomByPlayerId () {
        this.set('broadcastRoomId', 1)
      }),
      new Action('broadcastToRoom', function broadcastToRoom () {
        this.dispatch(`broadcast:${this.get('broadcastRoomId')}`, this.get('broadcastMessage'))
      })
    ]
  }
  const app = new Application(undefined, 'New App', {
    logLevel,
    silent
  }, undefined, undefined, [ actionGenerator ])

  const compiler = new Compiler(undefined, undefined, app)

  await compiler.loadSemantics()

  const flowNoteCode = `
node getClick = extractClickData, extractPlayerId
node extractXY = getXYCoordsFromClickData
node movePlayer = getPlayerById, detectPlayerMovementEvents, movePlayer, dispatchPlayerMovementEvents
node displayBoundaryError = getPlayerById, sendBoundaryError
node notifyRoom = getBroadcastMessage, getRoomByPlayerId, broadcastToRoom

flow click(GET /click) = getClick$ -> extractXY#clickBranch

clickBranch -Coordinates{ retry: 3 }> movePlayer*#move

clickBranch -BoundaryError! displayBoundaryError

clickBranch -> notifyRoom ... move
`

  compiler.compile(flowNoteCode)

  const result = await app.request('GET', '/click', {
    playerId: 1,
    click: {
      x: 2,
      y: 10
    },
    events: [
      {
        type: 'move'
      }
    ]
  })

  t.is(result.state.playerId, 1)
  t.is(result.state.clickX, 2)
  t.is(result.state.clickY, 10)
  t.is(result.state.player.id, 1)
  t.is(result.state.player.name, 'Alice')
  t.is(result.state.player.x, 12)
  t.is(result.state.player.y, 22)
})

test('Compiling a FlowNote into an Application with Import statement', async t => {
  const app = new Application(undefined, 'New App', {
    logLevel,
    silent
  })

  const compiler = new Compiler(undefined, undefined, app)
  await compiler.loadSemantics()

  const flowNoteCode = `
import "compiler/testActions.js" as FlowNote
import "compiler/test.flow" as FlowNote
`

  compiler.compile(flowNoteCode)

  const result = await app.request('GET', '/click', {
    playerId: 1,
    click: {
      x: 2,
      y: 10
    },
    events: [
      {
        type: 'move'
      }
    ]
  })

  t.is(result.state.playerId, 1)
  t.is(result.state.clickX, 2)
  t.is(result.state.clickY, 10)
  t.is(result.state.player.id, 1)
  t.is(result.state.player.name, 'Alice')
  t.is(result.state.player.x, 12)
  t.is(result.state.player.y, 22)
})

test('Flow with waitFor', async t => {
  const app = createApp()
  const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
  app.registerFlow(flow)

  const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
  const channelA = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
  const channelB = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, undefined, [])
  const halveXNode = new StandardNode(app, undefined, 'halveXNode', [], [], [ app.getAction('halveX') ])
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

  t.is(result.state.x, 7)
  t.is(result.state.y, 100)
})
