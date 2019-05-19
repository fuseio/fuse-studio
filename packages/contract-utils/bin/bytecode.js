#!/usr/bin/env node

const { createBytecodeDir } = require('../')

const [,, ...args] = process.argv

const relPath = args[0] || __dirname

createBytecodeDir(relPath)
