import Channel from '../channel'

class StandadChannel extends Channel {
  constructor (application, id, name, to, accepts = [], retry, actions = []) {
    const gotoNode = application.requireAction('gotoNode', function gotoNode () {
      this.dispatch('StandardNode')
    })
    super(application, id, name, to, [ 'StandardChannel' ].concat(accepts), retry, actions.concat([ gotoNode ]))
  }
}

export { StandadChannel as default }
