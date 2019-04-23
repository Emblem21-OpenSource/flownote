import StandardChannel from '../src/channels/standardChannel'
import StandardNode from '../src/nodes/standardNode'
import Flow from '../src/flow'
import Application from '../src/application'
import Action from '../src/action'

const test = require('ava')

const appName = 'Test'
const nodeName = 'Double X'
const channelName = 'Plain'

function doubleX () {
  this.set('x', this.get('x') * 2)
}

test('EventQueue.push and EventQueue.process', async t => {
  const app = new Application(undefined, appName)
  const flow = new Flow(app, undefined, 'Flow', undefined, undefined, 'GET', '/test')
  app.setPublicFlow(flow)

  const action = new Action(nodeName, doubleX, app)
  app.registerAction(action.name, action)

  const node1 = new StandardNode(app, undefined, 'Double X.1', [], [], [ action ])
  const channel = new StandardChannel(app, undefined, channelName)
  const node2 = new StandardNode(app, undefined, 'Double X.2', [], [], [ action ])

  flow.connect(node1)
  node1.connect(channel)
  channel.connect(node2)

  const result = await app.request('GET', '/test', {
    x: 7
  })

  t.is(result.state.x, 28)
})
