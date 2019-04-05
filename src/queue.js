import CommonClass from './utils/commonClass'

class Queue extends CommonClass {
  /**
   * [constructor description]
   * @param  {[type]} application [description]
   * @return {[type]}             [description]
   */
  constructor (application, type) {
    super()
    this.application = application
    this.type = type
  }

  /**
   * [push description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  push (event) {
    throw new Error('Queue has to have push() defined.')
  }

  /**
   * [pop description]
   * @return {[type]} [description]
   */
  pop () {
    throw new Error('Queue has to have pop() defined.')
  }

  /**
   * [isEmpty description]
   * @return {[type]} [description]
   */
  isEmpty () {
    throw new Error('Queue has to have isEmpty() defined.')
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    throw new Error('Queue has to have toJSON() defined.')
  }

  /**
   * [fromJSON description]
   * @param  {[type]} json [description]
   * @return {[type]}      [description]
   */
  fromJSON (json) {
    throw new Error('Queue has to fromJSON() defined.')
  }
}

export { Queue as default }
