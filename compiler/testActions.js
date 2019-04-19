import Action from '../src/action'

const actions = [
  new Action(undefined, undefined, 'extractClickData', function extractClickData () {
    this.set('click', this.get('click'))
  }),
  new Action(undefined, undefined, 'extractPlayerId', function extractPlayerId () {
    this.set('playerId', this.get('playerId'))
  }),
  new Action(undefined, undefined, 'getXYCoordsFromClickData', function getXYCoordsFromClickData () {
    this.set('clickX', this.get('click').x)
    this.set('clickY', this.get('click').y)
    this.dispatch('Coordinates')
  }),
  new Action(undefined, undefined, 'getPlayerById', function getPlayerById () {
    this.set('player', {
      id: this.get('playerId'),
      name: 'Alice',
      x: 10,
      y: 12
    })
  }),
  new Action(undefined, undefined, 'detectPlayerMovementEvents', function detectPlayerMovementEvents () {
    (this.get('events') || []).forEach(event => {
      if (event.type === 'move') {
        this.set('pendingMove', event)
      }
    })
  }),
  new Action(undefined, undefined, 'movePlayer', function movePlayer () {
    const player = this.get('player')
    player.x += this.get('clickX')
    player.y += this.get('clickY')
  }),
  new Action(undefined, undefined, 'dispatchPlayerMovementEvents', function dispatchPlayerMovementEvents () {
    this.dispatch('playerMoved')
  }),
  new Action(undefined, undefined, 'sendBoundaryError', function sendBoundaryError () {
    this.dispatch('BoundaryError')
  }),
  new Action(undefined, undefined, 'getBroadcastMessage', function getBroadcastMessage () {
    this.set('broadcastMessage', 'Player Moved')
  }),
  new Action(undefined, undefined, 'getRoomByPlayerId', function getRoomByPlayerId () {
    this.set('broadcastRoomId', 1)
  }),
  new Action(undefined, undefined, 'broadcastToRoom', function broadcastToRoom () {
    this.dispatch(`broadcast:${this.get('broadcastRoomId')}`, this.get('broadcastMessage'))
  })
]

export { actions as default}