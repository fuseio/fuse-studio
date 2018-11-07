const config = require('config')
const Agenda = require('agenda')
const getPastEvents = require('@utils/events/web3').getPastEvents
const agenda = new Agenda({db: {address: config.get('mongo.uri')}})

agenda.define('getPastEvents', async (job, done) => {
  await getPastEvents()
  done()
})

async function start () {
  console.log('Starting Agenda job scheduling')

  agenda.on('start', job => console.info(`Job ${job.attrs.name} starting`))
  agenda.on('complete', job => console.info(`Job ${job.attrs.name} finished`))
  agenda.on('success', job => console.info(`Job ${job.attrs.name} succeeded`))
  agenda.on('fail', job => console.warn(`Job ${job} failed`))

  await agenda.start()

  await agenda.now('getPastEvents')
  await agenda.every('10 minutes', 'getPastEvents')

  console.log('Agenda job scheduling is successfully defined')
}

module.exports = {
  start
}
