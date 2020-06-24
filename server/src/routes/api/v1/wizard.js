const router = require('express').Router()
const mongoose = require('mongoose')
const sendgridUtils = require('@utils/sendgrid')
const Wizard = mongoose.model('Wizard')
const config = require('config')

router.post('/', async (req, res) => {
  const { accountAddress, formData } = req.body
  if (formData.page === 0) {
    try {
      sendgridUtils.notifyManagers({ formData, networkType: config.get('network.foreign.name') })
    } catch (e) {
      console.error(e)
    }
  }
  try {
    const data = await new Wizard({ accountAddress, formData }).save()
    res.json({
      data
    })
  } catch (error) {
    const data = await Wizard.findOneAndUpdate(
      { accountAddress },
      { formData },
      { new: true, upsert: true }
    )
    res.json({
      data
    })
  }
})

module.exports = router
