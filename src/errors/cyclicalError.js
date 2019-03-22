class CyclicalError extends Error {
  constructor (message) {
    super(message)
    this.name = 'CyclicalError'
  }
}

module.exports = CyclicalError
