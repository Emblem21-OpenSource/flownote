import Action from './src/action'

const actions = [
  new Action(undefined, undefined, 'doubleX', function doubleX () {
    this.set('x', this.get('x') * 2)
  }),
  new Action(undefined, undefined, 'halveX', function halveX () {
    this.set('x', this.get('x') / 2)
  }),
  new Action(undefined, undefined, 'addXAndY', function addXAndY () {
    this.set('x', this.get('x') + this.get('y'))
  }),
  new Action(undefined, undefined, 'subtractXFromY', function subtractXFromY () {
    this.set('y', this.get('x') - this.get('y'))
  }),
  new Action(undefined, undefined, 'throwError', function throwError () {
    this.set('e', this.get('e') + 1)
    throw new Error('We break here')
  })
]

export { actions as default}