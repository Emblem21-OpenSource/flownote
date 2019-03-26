const cluster = require('cluster')

const stores = new Map()
let requestId = 0

// Register worker events
if (cluster.isMaster) {
  for (const id in cluster.workers) {
    cluster.workers[id].on('message', function getStoreHandler (worker, message) {
      switch (message.type) {
        case 'setStore':
          set(message.storeName, message.key, message.value)
          worker.send(`setStoreComplete-${message.nonce}`)
          break
        case 'getStore':
          worker.send(`getStoreComplete-${message.nonce}`, get(message.storeName, message.key))
          break
      }
    })
  }
}

/**
 * [set description]
 * @param {[type]} storeName [description]
 * @param {[type]} key       [description]
 * @param {[type]} value     [description]
 */
function set (storeName, key, value) {
  const data = stores.get(storeName) || {}
  data[key] = value
  stores.set(this, data)
}

/**
 * [get description]
 * @param  {[type]} storeName [description]
 * @param  {[type]} key       [description]
 * @return {[type]}           [description]
 */
function get (storeName, key) {
  return stores.get(storeName) || {}
}

/**
 * [set description]
 * @param {[type]} storeName [description]
 * @param {[type]} key       [description]
 * @param {[type]} value     [description]
 */
exports.set = function set (storeName, key, value) {
  if (cluster.isMaster) {
    set(storeName, key, value)
  } else if (cluster.isWorker) {
    const nonce = requestId

    process.send({
      type: 'setStore',
      nonce,
      storeName,
      key,
      value
    })

    requestId += 1

    return new Promise(resolve => {
      process.on(`setStoreComplete-${nonce}`, resolve)
    })
  }
}

/**
 * [get description]
 * @param  {[type]} storeName [description]
 * @param  {[type]} key       [description]
 * @return {[type]}           [description]
 */
exports.get = function get (storeName, key) {
  if (cluster.isMaster) {
    return get(storeName, key)
  } else if (cluster.isWorker) {
    const nonce = requestId

    process.send({
      type: 'getStore',
      nonce: nonce,
      storeName,
      key
    })

    requestId += 1

    return new Promise(resolve => {
      process.on(`getStoreComplete-${nonce}`, resolve)
    })
  }
}
