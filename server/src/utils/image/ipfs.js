const config = require('config')
const request = require('request')
const urlBase = config.get('ipfsProxy.urlBase')

const getImage = (req, res) => {
  const hash = req.params.hash
  return res.redirect(`${urlBase}/image/${hash}`)
}

const uploadImage = (req, res) => {
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
}

module.exports = {
  getImage,
  uploadImage
}