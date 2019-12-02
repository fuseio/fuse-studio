const { createPropertyDir, extendAbiWithEvents } = require('./utils')

module.exports = {
  createAbiDir: createPropertyDir.bind(null, 'abi'),
  createBytecodeDir: createPropertyDir.bind(null, 'bytecode'),
  extendAbiWithEvents
}
