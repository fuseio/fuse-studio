const config = require('config')
const Agenda = require('agenda')
const tasks = require('@utils/events/tasks')

const agenda = new Agenda({db: {address: config.get('mongo.uri')}})

agenda.define('processPastTokenCreatedEvents', async (job, done) => {
  await tasks.processPastTokenCreatedEvents()
  done()
})

agenda.define('processPastMarketOpenEvents', async (job, done) => {
  await tasks.processPastMarketOpenEvents()
  done()
})

agenda.define('processPastTransferEvents', async (job, done) => {
  await tasks.processPastTransferEvents()
  done()
})

async function start () {
  console.log('Starting Agenda job scheduling')

  agenda.on('start', job => console.info(`Job ${job.attrs.name} starting`))
  agenda.on('complete', job => console.info(`Job ${job.attrs.name} finished`))
  agenda.on('success', job => console.info(`Job ${job.attrs.name} succeeded`))
  agenda.on('fail', job => console.warn(`Job ${job} failed`))

  await agenda.start()

  await agenda.now('processPastTokenCreatedEvents')
  await agenda.every('10 minutes', 'processPastTokenCreatedEvents')

  await agenda.schedule('in 1 minute', 'processPastMarketOpenEvents')
  await agenda.every('10 minutes', 'processPastMarketOpenEvents', null, {skipImmediate: true})

  // run the task every day in 09:00 UTC (11:00 Israel)
  await agenda.every('00 9 * * *', 'processPastTransferEvents')
  await agenda.schedule('in 3 minute', 'processPastTransferEvents')

  console.log('Agenda job scheduling is successfully defined')
}

module.exports = {
  start
}
