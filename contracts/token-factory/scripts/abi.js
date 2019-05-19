const path = require('path')
const { createAbiDir } = require('@fuse/contract-utils')

const relPath = path.join(__dirname, '../')

createAbiDir(relPath)
