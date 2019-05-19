require('chai').should()

const { hasRole, combineRoles } = require('../')

/* eslint-disable no-unused-expressions */

describe('roles', () => {
  describe('#hasRole', () => {
    it('hasRole is not undefined', () => {
      hasRole.should.not.to.be.undefined
    })

    it('hasRole returns true when the same role is found', () => {
      hasRole('0x0000000000000000000000000000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000000000000000000000000000002').should.be.true
    })

    it('hasRole returns true when entity roles contains the roles to check', () => {
      hasRole('0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000000000000000000000000000001').should.be.true
    })

    it('hasRole returns false when entity roles does not contains the roles to check', () => {
      hasRole('0x0000000000000000000000000000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000000000000000000000000000001').should.not.be.true
    })

    it('hasRole returns false when entity roles does not contains one of the roles to check', () => {
      hasRole('0x0000000000000000000000000000000000000000000000000000000000000005',
        '0x0000000000000000000000000000000000000000000000000000000000000003').should.not.be.true
    })
  })

  describe('#combineRoles', () => {
    const role = '0x0000000000000000000000000000000000000000000000000000000000000003'

    it('combineRoles is not undefined', () => {
      combineRoles.should.not.to.be.undefined
    })

    it('combine same role give the same role', () => {
      combineRoles(role, role).should.equal(role)
    })

    it('combine same role with empty role gives the same role', () => {
      const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'
      combineRoles(role, zero).should.equal(role)
    })

    it('combine two roles together should give a combined role', () => {
      const userRole = '0x0000000000000000000000000000000000000000000000000000000000000001'
      const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000002'

      combineRoles(userRole, adminRole).should.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000003'
      )
    })

    it('combine three roles together should give a combined role', () => {
      const userRole = '0x0000000000000000000000000000000000000000000000000000000000000001'
      const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000002'
      const businessRole = '0x0000000000000000000000000000000000000000000000000000000000000008'

      combineRoles(userRole, adminRole, businessRole).should.equal(
        '0x000000000000000000000000000000000000000000000000000000000000000b'
      )
    })
  })
})
