import Application from './application'
import Channel from './channel'
import Milestone from './milestone'
import Flow from './flow'

/**
 * The Spider crawls flows as it is being assembled to check for problems and fix common configuration issues
 */
class Spider {
  search (source, target) {
    let list

    if (source instanceof Application) {
      if (source.publicFlow) {
        list = [ source.publicFlow.to ]
      } else {
        throw Error('Spider requires Application to have a Public Flow defined')
      }
    } else if ((source instanceof Channel) || (source instanceof Milestone) || (source instanceof Flow)) {
      list = [ source.to ]
    } else if (source.id !== undefined) {
      list = source.to
    } else {
      list = source
    }

    for (var i = 0, len = list.length; i < len; i++) {
      var found = false

      if ((target.id || target.name) && (list[i] === target || list[i].id === target.id || list[i].name === target.name)) {
        found = true
      } else if (list[i].id === target || list[i].name === target) {
        found = true
      }

      if (found) {
        return list[i]
      } else if (list[i].to) {
        return this.search(list[i].to, target)
      }
    }
    return false
  }
}

export { Spider as default }
