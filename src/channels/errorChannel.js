import Channel from '../channel'

class ErrorChannel extends Channel {
  constructor (application, id, name, to, accepts = [], retry, retryDelay, actions = []) {
    const gotoNode = application.requireAction('gotoNode', function gotoNode () {
      this.dispatch('StandardNode')
    })
    super(application, id, name, to, [ 'Error' ].concat(accepts), retry, retryDelay, actions.concat([ gotoNode ]))
  }
}

export { ErrorChannel as default }
