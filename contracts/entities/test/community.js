const Community = artifacts.require('Community.sol')
const EntitiesList = artifacts.require('EntitiesList.sol')
const truffleAssert = require('truffle-assertions')

const {
  ADMIN_MASK,
  NO_ROLES,
  BUSINESS_MASK,
  USER_ROLE,
  ADMIN_ROLE,
  BUSINESS_ROLE
} = require('./roles')

const { ERROR_MSG } = require('./setup')

contract('Community', (accounts) => {
  let community, entitiesList
  const owner = accounts[0]
  const notOwner = accounts[1]
  const user = accounts[2]
  const anotherUser = accounts[3]

  const validateEntity = async (account, entity) => {
    const roles = await entitiesList.rolesOf(account)
    assert.equal(roles, entity.roles)
  }

  const validateNoEntity = (account) => validateEntity(account, { roles: NO_ROLES })

  const eventEmitted = async (result, ...args) => {
    const entitiesResult = await truffleAssert.createTransactionResult(entitiesList, result.tx)
    truffleAssert.eventEmitted(entitiesResult, ...args)
  }

  beforeEach(async () => {
    community = await Community.new('My Community')
    entitiesList = await EntitiesList.at(await community.entitiesList())
  })

  describe('#constructor', () => {
    it('community got correct name', async () => {
      community = await Community.new('My Community')
      assert.equal('My Community', await community.name())
    })

    it('can create community without name', async () => {
      community = await Community.new('')
      assert.equal('', await community.name())
    })

    it('creator is admin of the community', async () => {
      const entity = { roles: ADMIN_ROLE }
      community = await Community.new('My Community')

      await validateEntity(owner, entity)
    })
  })

  describe('#setEntitiesList', () => {
    it('admin can set entities list', async () => {
      const entitiesList = await EntitiesList.new()
      await community.setEntitiesList(entitiesList.address, { from: owner }).should.be.fulfilled
      assert.equal(await community.entitiesList(), entitiesList.address)
    })

    it('only admin can set entities list', async () => {
      const entitiesList = await EntitiesList.new()
      await community.setEntitiesList(entitiesList.address, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
    })
  })

  describe('#join', () => {
    it('user can join community', async () => {
      const entity = { roles: USER_ROLE }
      const result = await community.join({ from: user }).should.be.fulfilled

      eventEmitted(result, 'EntityAdded', { account: user, roles: entity.roles })
      await validateEntity(user, entity)
    })

    it('user cannot join twice ', async () => {
      const entity = { roles: USER_ROLE }
      await community.join({ from: user }).should.be.fulfilled
      await validateEntity(user, entity)

      await community.join({ from: user }).should.be.rejectedWith(ERROR_MSG)
    })
  })

  describe('#addEntity', () => {
    it('owner can add user', async () => {
      const entity = { roles: USER_ROLE }
      const result = await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityAdded')
      await validateEntity(user, entity)
    })

    it('only owner can add user', async () => {
      const entity = { roles: USER_ROLE }
      await community.addEntity(user, entity.roles, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
      await validateNoEntity(user)
    })

    it('owner can add business', async () => {
      const entity = { roles: BUSINESS_ROLE }
      const result = await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityAdded', { account: user, roles: entity.roles })
      await validateEntity(user, entity)
    })

    it('owner can add admin', async () => {
      const entity = { roles: ADMIN_ROLE }
      const result = await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityAdded', { account: user, roles: entity.roles })
      await validateEntity(user, entity)
      assert.isOk(await entitiesList.hasRoles(user, ADMIN_MASK).should.be.fulfilled)
    })

    it('can add multiple user', async () => {
      const entity = { roles: USER_ROLE }
      const anotherEntity = { roles: USER_ROLE }

      const result1 = await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
      const result2 = await community.addEntity(anotherUser, anotherEntity.roles, { from: owner }).should.be.fulfilled

      eventEmitted(result1, 'EntityAdded', { account: user, roles: entity.roles })
      eventEmitted(result2, 'EntityAdded', { account: anotherUser, roles: anotherEntity.roles })

      await validateEntity(user, entity)
      await validateEntity(anotherUser, anotherEntity)
    })

    it('cannot add same user twice', async () => {
      const entity = { roles: USER_ROLE }
      const anotherEntity = { roles: USER_ROLE }

      await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
      await community.addEntity(user, anotherEntity.roles, { from: owner }).should.be.rejectedWith(ERROR_MSG)

      await validateEntity(user, entity)
    })
  })

  describe('#removeEntity', () => {
    const entity = { roles: USER_ROLE }

    beforeEach(async () => {
      await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
    })
    it('owner can remove entity', async () => {
      const result = await community.removeEntity(user, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityRemoved', { account: user })
      await validateNoEntity(user)
    })

    it('only owner can remove entity', async () => {
      await community.removeEntity(user, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
      await validateEntity(user, entity)
    })
  })

  describe('#addEnitityRoles', () => {
    const entity = { roles: USER_ROLE }

    beforeEach(async () => {
      await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
    })
    it('owner can add entity roles', async () => {
      const result = await community.addEnitityRoles(user, BUSINESS_MASK, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityRolesUpdated', { account: user, roles: BUSINESS_ROLE })
      await validateEntity(user, { roles: BUSINESS_ROLE })
    })

    it('only owner can add entity roles', async () => {
      await community.addEnitityRoles(user, BUSINESS_MASK, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
      await validateEntity(user, entity)
    })

    it('adding the same role does not change the entity', async () => {
      const result = await community.addEnitityRoles(user, USER_ROLE, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityRolesUpdated', { account: user, roles: USER_ROLE })
      await validateEntity(user, { roles: USER_ROLE })
    })
  })

  describe('#removeEnitityRoles', () => {
    const entity = { roles: BUSINESS_ROLE }

    beforeEach(async () => {
      await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
    })

    it('owner can remove entity roles', async () => {
      const result = await community.removeEnitityRoles(user, BUSINESS_MASK, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityRolesUpdated', { account: user, roles: USER_ROLE })
      await validateEntity(user, { roles: USER_ROLE })
    })

    it('only owner can remove entity roles', async () => {
      await community.removeEnitityRoles(user, BUSINESS_MASK, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
      await validateEntity(user, entity)
    })

    it('remove not existing role does not change the entity', async () => {
      const result = await community.removeEnitityRoles(user, ADMIN_MASK, { from: owner }).should.be.fulfilled

      eventEmitted(result, 'EntityRolesUpdated', { account: user, roles: BUSINESS_ROLE })
      await validateEntity(user, { roles: BUSINESS_ROLE })
    })
  })

  describe('#hasRoles', () => {
    const entity = { roles: BUSINESS_ROLE }

    beforeEach(async () => {
      await community.addEntity(user, entity.roles, { from: owner }).should.be.fulfilled
    })

    it('business entity is both business and user', async () => {
      assert.isOk(await community.hasRoles(user, USER_ROLE))
      assert.isOk(await community.hasRoles(user, BUSINESS_MASK))
      assert.isOk(await community.hasRoles(user, BUSINESS_ROLE))
    })

    it('business entity is both business and user', async () => {
      assert.isOk(await community.hasRoles(user, USER_ROLE))
      assert.isOk(await community.hasRoles(user, BUSINESS_MASK))
      assert.isOk(await community.hasRoles(user, BUSINESS_ROLE))
    })

    it('business entity is not admin', async () => {
      assert.isNotOk(await community.hasRoles(user, ADMIN_ROLE))
    })

    it('not joined user has no roles', async () => {
      assert.isNotOk(await community.hasRoles(anotherUser, USER_ROLE))
      assert.isOk(await community.hasRoles(anotherUser, NO_ROLES))
    })
  })
})
