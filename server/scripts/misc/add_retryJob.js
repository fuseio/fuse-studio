require('module-alias/register')
require('../../src/services/mongo').start()
global.config = require('config')

const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const filename = process.argv[2]
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(filename)
})

lineReader.on('line', async function (line) {
  const oldJob = line.split(',')[1].split(' ')[3]
  const retryJob = line.split(',')[1].split(' ')[10]

  const j = await QueueJob.findById(oldJob)
  j.retryJob = retryJob
  await j.save()
  console.log(oldJob, retryJob)
})
