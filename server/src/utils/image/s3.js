const AWS = require('aws-sdk')
const imageType = require('image-type')
const config = require('config')
const crypto = require('crypto')

const s3 = new AWS.S3()

const getImage = (req, res) => {
  const { hash } = req.params
  const imageUri = `https://${config.get('aws.s3.bucket')}.s3.amazonaws.com/${hash}`
  // const hash = req.params.hash
  // // const uri =
  return res.redirect(imageUri)
}

const uploadImage = (req, res) => {
  const hash = crypto
    .createHash('sha256')
    .update(req.file.buffer)
    .digest('hex')
  console.log(`saving image by hash ${hash}`)

  const type = imageType(req.file.buffer)

  const params = {
    Bucket: config.get('aws.s3.bucket'),
    ContentType: type ? type.mime : 'image/png',
    Key: `${hash}`,
    ACL: 'public-read',
    Body: req.file.buffer
  }
  return s3.upload(params, (err, data) => {
    if (err) {
      console.error(err)
      res.status(400).json({ error: err.message })
      return
    }
    console.log({ data })
    res.send({ hash: hash, uri: data.Location })
  })
}

module.exports = {
  getImage,
  uploadImage
}
