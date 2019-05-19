const roles = require('./roles')
const util = require('ethereumjs-util')

const hasRole = (roles, role) => {
  const sameRoles = parseInt(roles, 16) & parseInt(role, 16)
  return sameRoles === parseInt(role, 16)
}

const combineRoles = (...roles) => {
  const combinedRole = roles.reduce((accumulatedRole, role) => accumulatedRole | parseInt(role, 16), parseInt(roles[0], 16))
  return util.bufferToHex(util.setLengthLeft(combinedRole, 32))
}

module.exports = {
  roles,
  combineRoles,
  hasRole
}
