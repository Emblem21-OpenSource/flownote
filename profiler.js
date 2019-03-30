require = require('esm')(module)
//const fasterPromise = require('bluebird')
//global.Promise = fasterPromise
const profiler = require('./src/utils/profiler')
profiler.listen(3000, 'localhost')

// https://v8.dev/blog/fast-async
// https://github.com/suguru03/aigle
