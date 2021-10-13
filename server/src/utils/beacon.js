const config = require('config')
const mongoose = require('mongoose')
const Beacon = mongoose.model('Beacon')
const BeaconCounter = mongoose.model('BeaconCounter')

const createBeacon = async ({ walletAddress }) => {
  const proximityUUID = config.get('beacons.proximityUUID')
  let beaconCounter = await BeaconCounter.findOneAndUpdate({ proximityUUID }, { $inc: { minor: 1 } }, { new: true })
  if (!beaconCounter) {
    beaconCounter = await new BeaconCounter({ proximityUUID }).save()
  }
  const { major, minor } = beaconCounter
  const beacon = await new Beacon({
    walletAddress,
    proximityUUID,
    major,
    minor
  }).save()
  return beacon
}

const getBeacon = ({ major, minor }) => {
  const proximityUUID = config.get('beacons.proximityUUID')
  return Beacon.findOne({ proximityUUID, major, minor })
}

module.exports = {
  createBeacon,
  getBeacon
}
