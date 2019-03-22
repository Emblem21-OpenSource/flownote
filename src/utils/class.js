module.exports = {
  /**
   * Returns if any part of an object's class hierarchy is part of a class
   * @param  {Object}  objectInstance
   * @param  {Class}  classType
   * @return {Boolean}
   */
  isOfClass (objectInstance, classType) {
    return objectInstance.name === classType.name ||
      objectInstance.constructor.name === classType.name ||
      Object.getPrototypeOf(objectInstance.constructor).name === classType.name ||
      Object.getPrototypeOf(objectInstance.constructor.constructor).name === classType.name ||
      Object.getPrototypeOf(objectInstance.constructor.constructor.constructor).name === classType.name
  },

  /**
   * Returns if an object instance is a child of a class
   * @param  {Object}  objectInstance
   * @param  {Class}  classType
   * @return {Boolean}
   */
  isChildOf (objectInstance, classType) {
    return Object.getPrototypeOf(objectInstance.constructor).name === classType.name
  }
}
