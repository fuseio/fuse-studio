const config = require('config')

const isMagic = (phoneNumber) => {
  return config.get('env') === 'qa' && phoneNumber.endsWith(config.get('phoneNumbers.magic'))
}

const isTeam = (phoneNumber) => {
  return config.has('phoneNumbers.team') ? config.get('phoneNumbers.team').split(',').includes(phoneNumber) : false
}

const isBlocked = (phoneNumber) => {
  const blockedPrefixes = (config.has('phoneNumbers.blockedPrefixes') && config.get('phoneNumbers.blockedPrefixes').split(',')) || []
  const isBlocked = blockedPrefixes.filter(bp => phoneNumber.startsWith(bp)).length > 0
  return isBlocked
}

module.exports = {
  isMagic,
  isTeam,
  isBlocked
}
