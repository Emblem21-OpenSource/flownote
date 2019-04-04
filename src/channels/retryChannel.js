import Channel from '../channel'

class RetryChannel extends Channel {
  constructor (application, id, name, to, accepts = [], retry, actions = []) {
    const retryNode = application.requireAction('retryNode', function retryNode () {
      this.dispatch('RetryChannel')
    })
    super(application, id, name, to, [ 'RetryChannel' ].concat(accepts), retry, actions.concat([ retryNode ]))
  }
}

export { RetryChannel as default }
