const router = require('express').Router()
const config = require('config')
const request = require('request')

const urlBase = config.get('ipfsProxy.urlBase')

router.get('/:hash', async (req, res, next) => {
  const hash = req.params.hash

  return request.get(`${urlBase}/metadata/${hash}`, {
  }, (error, response, body) => {
    if (error) {
      throw error
    }
    res.json(JSON.parse(body))
  })
})

router.post('/', async (req, res, next) => {
  return request.post(`${urlBase}/metadata`, {
    json: true,
    body: {data: req.body.metadata}
  }, (error, response, body) => {
    if (error) {
      throw error
    }
    res.json(body)
  })
})

module.exports = router
