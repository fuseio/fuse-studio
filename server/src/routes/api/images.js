const router = require('express').Router()
const multer = require('multer')
const config = require('config')
const request = require('request')

const urlBase = config.get('ipfsProxy.urlBase')

const upload = multer()

router.get('/:hash', async (req, res) => {
  const hash = req.params.hash
  return request.get(`${urlBase}/image/${hash}`, (error, response, body) => {
    if (error) {
      throw error
    }
    return res.set('Content-Type', 'image')
      .send(body)
  })
})

router.post('/', upload.single('image'), async (req, res) => {
  let formData = {
    file: {
      value: req.file.buffer,
      options: {
        contentType: req.file.mimetype,
        filename: req.file.originalname
      }
    }
  }
  return request.post(`${urlBase}/image`, {
    formData
  }, (error, response, body) => {
    if (error) {
      throw error
    }
    return res.set('Content-Type', 'application/json')
      .send(body)
  })
})

module.exports = router
