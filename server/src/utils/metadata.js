const config = require('config')
const request = require('request-promise-native')

const urlBase = config.get('ipfsProxy.urlBase')

async function getMetadata (hash) {
  const body = await request.get(`${urlBase}/metadata/${hash}`)
  return JSON.parse(body)
}

async function createMetadata (metadata) {
  return request.post(`${urlBase}/metadata`, {
    json: true,
    body: {data: metadata}
  })
}

module.exports = {
  getMetadata,
  createMetadata
}
