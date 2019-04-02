import Milestone from '../milestone'

class StandardMilestone extends Milestone {
  constructor (application, id, name, strategy, to, actions = []) {
    const gotoChannel = application.requireAction('gotoChannel', function gotoChannel () {
      this.dispatch('StandardChannel')
    })

    super(application, id, name, strategy, to, actions.concat([ gotoChannel ]))
  }
}

export { StandardMilestone as default }
