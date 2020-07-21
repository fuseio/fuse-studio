const mongoose = require('mongoose')
const Metadata = mongoose.model('Metadata')

const getMetadata = (hash) => Metadata.findOne({ hash: hash })

async function createMetadata (data, apiBase) {
  const metadata = await new Metadata({ data }).save()
  metadata.hash = metadata._id.toString()
  metadata.uri = `${apiBase}/${metadata._id.toString()}`
  await metadata.save()
  return metadata
}

module.exports = {
  getMetadata,
  createMetadata
}
