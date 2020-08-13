const mongoose = require('mongoose')
const { Schema } = mongoose

const AgendaJobsSchema = new Schema({
  name: { type: String },
  data: { type: Object },
  priority: { type: Number },
  type: { type: String },
  nextRunAt: { type: Date },
  lastModifiedBy: { type: Date },
  lockedAt: { type: Date },
  lastRunAt: { type: Date },
  lastFinishedAt: { type: Date }
}, { collection: 'agendaJobs' })

const AgendaJob = mongoose.model('AgendaJob', AgendaJobsSchema)

module.exports = AgendaJob
