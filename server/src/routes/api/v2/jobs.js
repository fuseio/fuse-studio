const router = require('express').Router()
var mongoose = require('mongoose')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

router.get('/:id', auth.required, async (req, res) => {
  const jobs = await agenda.jobs({ _id: mongoose.Types.ObjectId(req.params.id) })
  res.json({ data: jobs[0] })
})

module.exports = router
