const { RelayJobParser } = require('@utils/job/relay')
const signatureStore = require('./signatureStore')

const relayJobParser = new RelayJobParser(signatureStore)

module.exports = relayJobParser
