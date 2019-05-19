#!/usr/bin/env node

const { createAbiDir } = require('../')

const [,, ...args] = process.argv

const relPath = args[0] || __dirname

createAbiDir(relPath)
