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
    var i, len

    if (source instanceof Application) {
      if (source.publicFlow) {
        // Public Flow is designated
        return this.search(source.publicFlow, target)
      } else {
        // Search all flows of an application
        for (i = 0, len = source.flows; i < len; i++) {
          const result = this.search(source.flows[i], target)
          if (result) {
            return result
          }
        }
        return false
      }
    } else if ((source instanceof Channel) || (source instanceof Milestone) || (source instanceof Flow)) {
      // Dealing with a step
      list = [ source.to ]
    } else if (source.id !== undefined) {
      // Dealing with text
      list = source.to
    } else {
      // Forgot what this is for lol
      list = source
    }

    for (i = 0, len = list.length; i < len; i++) {
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
