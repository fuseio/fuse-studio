const router = require('express').Router()
const mongoose = require('mongoose')
const Beacon = mongoose.model('Beacon')

const createBeacon = async ({ proximityUUID }) => {
  const lastBeacon = await Beacon.findOne({ proximityUUID }).sort({ major: -1, minor: -1 })
  lastBeacon = 
}


module.exports = {
  createBeacon
}