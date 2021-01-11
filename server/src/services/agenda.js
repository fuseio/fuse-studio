/* eslint eqeqeq: "off" */
const config = require('config')
const Agenda = require('agenda')
const tasks = require('@tasks')
const lodash = require('lodash')
const yn = require('yn')

const agenda = new Agenda({ ...config.get('agenda.args'), db: { address: config.get('mongo.uri'), options: config.get('mongo.options') } })

const getConfig = (taskName) => config.has(`agenda.tasks.${taskName}`) ? config.get(`agenda.tasks.${taskName}`) : {}

Object.entries(tasks).forEach(([taskName, task]) => {
  const runJob = async (job, done) => {
    try {
      job.attrs.data ? await task(job.attrs.data, job) : await task(job)
    } catch (err) {
      console.log({ err })
      return done(err)
    }
    done()
  }

  console.log(`adding definition of task ${taskName}`)
  agenda.define(taskName, getConfig(taskName), runJob)
})

async function start () {
  console.log('Starting Agenda job scheduling')

  agenda.on('start', job => console.info(`Job ${job.attrs.name} starting. id: ${job.attrs._id}`))
  agenda.on('complete', job => console.info(`Job ${job.attrs.name} finished. id: ${job.attrs._id}`))
  agenda.on('success', job => console.info(`Job ${job.attrs.name} succeeded. id: ${job.attrs._id}`))
  agenda.on('fail', (error, job) => console.error(`Job ${job.attrs.name} failed. id: ${job.attrs._id}. ${error}`))

  await agenda.start()

  if (yn(config.get('agenda.startPeriodicTasks'))) {
    await agenda.every('1 hour', 'proccessPendingTransactions')
    await agenda.every('1 hour', 'startTransfers')
    await agenda.every('1 hour', 'lockedAccounts')
    await agenda.every('0 2 * * *', 'calculateCurrentTvl', { timezone: 'GMT' })

    await agenda.now('proccessPendingTransactions')
  }

  console.log('Agenda job scheduling is successfully defined')
}

const now = agenda.now

agenda.now = async (name, data) => {
  const correlationId = lodash.get(data, 'correlationId')
  if (correlationId) {
    const jobs = await agenda.jobs({ 'data.correlationId': correlationId })
    const savedJob = jobs[0]
    if (savedJob) {
      throw Error(`Job with the correlationId ${correlationId} already exists`)
    }
  }
  console.log(`Requesting to start a job ${name} with arguments: ${JSON.stringify(data)}`)
  return now.call(agenda, name, data)
}

module.exports = {
  start,
  agenda
}
