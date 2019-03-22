const {parse, stringify} = require('flatted/cjs')

class CommonClass {
  /**
   * [asFlattened description]
   * @return {[type]} [description]
   */
  asFlattened () {
    return stringify(this)
  }

  /**
   * [loadFlattened description]
   * @return {[type]} [description]
   */
  loadFlattened (string) {
    this.fromJSON(parse(string))
    return this
  }
}

module.exports = CommonClass
