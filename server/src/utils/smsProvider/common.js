const config = require('config')

const isMagic = (phoneNumber) => {
  return config.get('env') === 'qa' && phoneNumber.endsWith(config.get('phoneNumbers.magic'))
}

const isTeam = (phoneNumber) => {
  return config.has('phoneNumbers.team') ? config.get('phoneNumbers.team').split(',').includes(phoneNumber) : false
}

module.exports = {
  isMagic,
  isTeam
}
