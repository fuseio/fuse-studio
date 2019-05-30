const config = require('config')
const Agenda = require('agenda')
const tasks = require('@events/tasks')

const agenda = new Agenda({ db: { address: config.get('mongo.uri'), options: config.get('mongo.options') } })

agenda.define('processPastTokenCreatedEvents', async (job, done) => {
  await tasks.processPastTokenCreatedEvents()
  done()
})

agenda.define('processPastTransferEvents', async (job, done) => {
  await tasks.processPastTransferEvents()
  done()
})

agenda.define('processPastBridgeMappingEvents', async (job, done) => {
  await tasks.processPastBridgeMappingEvents()
  done()
})

async function start () {
  console.log('Starting Agenda job scheduling')

  agenda.on('start', job => console.info(`Job ${job.attrs.name} starting`))
  agenda.on('complete', job => console.info(`Job ${job.attrs.name} finished`))
  agenda.on('success', job => console.info(`Job ${job.attrs.name} succeeded`))
  agenda.on('fail', job => console.warn(`Job ${job} failed`))

  await agenda.start()

  await agenda.now('processPastBridgeMappingEvents')
  await agenda.now('processPastTokenCreatedEvents')
  await agenda.every('10 minutes', 'processPastTokenCreatedEvents')

  // run the task every hour
  await agenda.every('00 * * * *', 'processPastTransferEvents')
  await agenda.now('processPastTransferEvents')

  console.log('Agenda job scheduling is successfully defined')
}

module.exports = {
  start
}
