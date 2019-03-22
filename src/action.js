const CommonClass = require('./utils/commonClass')

class Action extends CommonClass {
  /**
   */
  constructor (applicaiton, id, name, method) {
    super()
    this.application = applicaiton
    if (name !== undefined) {
      this.fromJSON({
        id: id || this.application.getUniqueId(),
        name: name || 'Unnamed',
        method: method || '() => {}'
      })
    }
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      method: this.method.toString()
    }
  }

  /**
   * [fromJSON description]
   * @param  {[type]} json [description]
   * @return {[type]}      [description]
   */
  fromJSON (json) {
    let result
    if (typeof json === 'string') {
      result = this.loadFlattened(json)
    } else if (json instanceof Object && !(json instanceof Array)) {
      result = json
    } else {
      throw new Error(`Expected Action JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.id = result.id
    this.name = result.name

    if (typeof result.method === 'string') {
      this.method = new Function(`return ${result.method}`)()
    } else {
      this.method = result.method
    }
    return this
  }

  /**
   * [execute description]
   * @param  {[type]} actionContext [description]
   * @return {[type]}               [description]
   */
  async execute (actionContext) {
    await this.method.call(actionContext)
  }
}

module.exports = Action
