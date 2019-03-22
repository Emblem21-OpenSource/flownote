require = require('esm')(module)

const profiler = require('./src/utils/profiler')
profiler.listen(3000, 'localhost')