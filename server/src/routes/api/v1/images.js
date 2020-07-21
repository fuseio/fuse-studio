const router = require('express').Router()
const multer = require('multer')
const imageUtils = require('@utils/image')

const upload = multer()

router.get('/:hash', async (req, res) => {
  return imageUtils.getImage(req, res)
  // return imageUtils.getImage(req, res)
  // const hash = req.params.hash
  // return res.redirect(`${urlBase}/image/${hash}`)
})

router.post('/', upload.single('image'), async (req, res) => {
  return imageUtils.uploadImage(req, res)
  // imageUtils.
  // let formData = {
  //   file: {
  //     value: req.file.buffer,
  //     options: {
  //       contentType: req.file.mimetype,
  //       filename: req.file.originalname
  //     }
  //   }
  // }
  // return request.post(`${urlBase}/image`, {
  //   formData
  // }, (error, response, body) => {
  //   if (error) {
  //     throw error
  //   }
  //   return res.set('Content-Type', 'application/json')
  //     .send(body)
  // })
})

module.exports = router
