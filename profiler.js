require = require('esm')(module)
const profiler = require('./src/utils/profiler').default
profiler.listen(3000, 'localhost')
