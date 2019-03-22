const hyperId = require('hyperid')

/**
 * Returns a new UUID
 * @return String
 */
module.exports = () => {
  return hyperId()
}
