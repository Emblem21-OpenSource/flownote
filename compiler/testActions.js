import Action from '../src/action'

const actions = [
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

export { actions as default}