const mongoose = require('mongoose')
const { Schema } = mongoose

const transform = (doc, ret) => ({ ...ret, amount: doc.amount ? doc.amount.toString() : undefined })

const WizardSchema = new Schema({
  accountAddress: { type: String, required: [true, "can't be blank"] },
  formData: { type: Object, default: {} }
}, { timestamp: true })

WizardSchema.index({ accountAddress: 1 }, { unique: true })

WizardSchema.set('toJSON', {
  transform
})

WizardSchema.set('toObject', {
  transform
})

const Wizard = mongoose.model('Wizard', WizardSchema)

module.exports = Wizard
