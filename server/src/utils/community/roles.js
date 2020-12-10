const { hasRole, roles: { ADMIN_ROLE, USER_ROLE, BUSINESS_ROLE, APPROVED_ROLE } } = require('@fuse/roles')

const deriveType = (roles) => {
  if (hasRole(roles, BUSINESS_ROLE)) {
    return 'business'
  }
  if (hasRole(roles, USER_ROLE)) {
    return 'user'
  }
}

const deriveFromRoles = (roles) => {
  const type = deriveType(roles)
  const isAdmin = hasRole(roles, ADMIN_ROLE)
  const isApproved = hasRole(roles, APPROVED_ROLE)
  return { type, isAdmin, isApproved }
}

module.exports = {
  deriveType,
  deriveFromRoles
}
