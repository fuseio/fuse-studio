const router = require('express').Router()
const mongoose = require('mongoose')
const Wizard = mongoose.model('Wizard')

router.post('/', async (req, res) => {
  const { accountAddress, formData } = req.body
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
