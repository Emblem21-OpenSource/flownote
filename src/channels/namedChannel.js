import Channel from '../channel'

class NamedChannel extends Channel {
  constructor (application, id, name, to, accepts = [], retry, retryDelay, actions = []) {
    const gotoNode = application.requireAction('gotoNodeFromNamedChannel', function gotoNode () {
      this.dispatch('StandardNode')
    })
    super(application, id, name, to, accepts, retry, retryDelay, actions.concat([ gotoNode ]))
  }
}

export { NamedChannel as default }
