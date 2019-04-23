import StandardChannel from '../src/channels/standardChannel'
import StandardNode from '../src/nodes/standardNode'
import Flow from '../src/flow'
import Application from '../src/application'
import Action from '../src/action'

const test = require('ava')
const rangedFuzzing = require('fuzzur')

const rangedFuzzingOptions = {}

/**
 * [createApp description]
 * @return {[type]} [description]
 */
function createApp () {
  const app = new Application(undefined, 'Test App', {
    logLevel: 2
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
  const setXYToOne = new Action('setXYToOne', function setXYToOne () {
    this.set('x', 1)
    this.set('y', 1)
  }, app)
  const delayTwentyMilliseconds = new Action('delayTwentyMilliseconds', function delayTwentyMilliseconds () {
    return new Promise(resolve => setTimeout(() => {
      this.set('y', this.get('y') * 10)
      resolve()
    }, 20))
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
  app.registerAction(delayTwentyMilliseconds.name, delayTwentyMilliseconds)
  app.registerAction(waitForDelay.name, waitForDelay)

  return app
}

test('Fuzz Testing Request', async t => {
  const app = createApp()
  app.listen()
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

  const request = async () => {
    return app.request('GET', '/testFlow', rangedFuzzing.mutate({
      x: 7,
      y: 10
    }, rangedFuzzingOptions))
  }

  const requests = []

  for (var i = 0; i < 1000; i++) {
    requests.push(request())
  }

  await t.notThrowsAsync(Promise.all(requests))
})
