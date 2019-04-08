import Node from '../node'

class StandardNode extends Node {
  constructor (application, id, name, to, tags, actions = []) {
    const gotoChannel = application.requireAction('gotoChannel', function gotoChannel () {
      this.dispatch('StandardChannel')
    })

    super(application, id, name, to, tags, actions.concat([ gotoChannel ]))
  }
}

export { StandardNode as default }
