const stores = new Map()

/**
 * [set description]
 * @param {[type]} storeName [description]
 * @param {[type]} key       [description]
 * @param {[type]} value     [description]
 */
exports.set = function set (storeName, key, value) {
  const data = stores.get(storeName) || {}
  data[key] = value
  stores.set(storeName, data)
}

/**
 * [get description]
 * @param  {[type]} storeName [description]
 * @param  {[type]} key       [description]
 * @return {[type]}           [description]
 */
exports.get = function get (storeName, key) {
  return (stores.get(storeName) || {})[key]
}
