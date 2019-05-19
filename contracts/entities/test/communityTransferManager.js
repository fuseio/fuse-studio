const CommunityTransferManager = artifacts.require('CommunityTransferManager.sol')
const EntitiesList = artifacts.require('EntitiesList.sol')
const truffleAssert = require('truffle-assertions')

const { ERROR_MSG } = require('./setup')
const {
  USER_MASK,
  BUSINESS_MASK,
  NO_ROLES,
  USER_ROLE,
  ADMIN_ROLE,
  BUSINESS_ROLE
} = require('./roles')

contract('CommunityTransferManager', async (accounts) => {
  let transferManager, entitiesList
  const owner = accounts[0]
  const notOwner = accounts[1]
  const user = accounts[2]
  const anotherUser = accounts[3]
  const business = accounts[4]

  const validateEntity = async (account, entity) => {
    const roles = await entitiesList.rolesOf(account)
    assert.equal(entity.roles, roles)
  }

  beforeEach(async () => {
    transferManager = await CommunityTransferManager.new()
    entitiesList = await EntitiesList.at(await transferManager.entitiesList())
  })

  describe('#constructor', () => {
    it('creator is admin of the community', async () => {
      const entity = { roles: ADMIN_ROLE }
      transferManager = await CommunityTransferManager.new()
      await validateEntity(owner, entity)
    })
  })

  describe('#addRule', async () => {
    it('owner can add rule', async () => {
      const result = await transferManager.addRule(ADMIN_ROLE, NO_ROLES, { from: owner }).should.be.fulfilled

      truffleAssert.eventEmitted(result, 'RuleAdded')
    })

    it('only owner can add rule', async () => {
      await transferManager.addRule(ADMIN_ROLE, NO_ROLES, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
    })

    it('cannot add more than 20 rules', async () => {
      for (let i = 0; i < 20; i++) {
        await transferManager.addRule(USER_MASK, USER_MASK, { from: owner }).should.be.fulfilled
      }
      await transferManager.addRule(USER_MASK, USER_MASK, { from: owner }).should.be.rejectedWith(ERROR_MSG)
    })
  })

  describe('#removeRule', async () => {
    beforeEach(async () => {
      await transferManager.addRule(USER_ROLE, USER_ROLE, { from: owner }).should.be.fulfilled
    })

    it('owner can remove rule', async () => {
      const result = await transferManager.removeRule(0, { from: owner }).should.be.fulfilled

      truffleAssert.eventEmitted(result, 'RuleRemoved')
    })

    it('only owner can remove rule', async () => {
      await transferManager.removeRule(0, { from: notOwner }).should.be.rejectedWith(ERROR_MSG)
    })

    it('cannot remove rule with wrong index', async () => {
      await transferManager.removeRule(1, { from: owner }).should.be.rejectedWith(ERROR_MSG)
    })
  })

  describe('#verifyTransfer', () => {
    describe('#no rules given', () => {
      it('not joined users can transfer', async () => {
        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 1))
      })

      it('joined users can transfer', async () => {
        await transferManager.join({ from: user }).should.be.fulfilled
        await transferManager.join({ from: anotherUser }).should.be.fulfilled

        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 1))
        assert.isOk(await transferManager.verifyTransfer(anotherUser, user, 1))
      })
    })

    describe('#rule: only joined users', () => {
      beforeEach(async () => {
        await transferManager.addRule(USER_ROLE, USER_ROLE, { from: owner }).should.be.fulfilled
      })

      it('if both users are not joined, verifyTransfer is false', async () => {
        assert.isNotOk(await transferManager.verifyTransfer(user, anotherUser, 1))
      })

      it('if sender is not registered, verifyTransfer is false', async () => {
        await transferManager.join({ from: anotherUser }).should.be.fulfilled

        assert.isNotOk(await transferManager.verifyTransfer(user, anotherUser, 1))
      })

      it('if receiver is not registered, verifyTransfer is false', async () => {
        await transferManager.join({ from: user }).should.be.fulfilled

        assert.isNotOk(await transferManager.verifyTransfer(user, anotherUser, 1))
      })

      it('joined users can transfer', async () => {
        await transferManager.join({ from: user }).should.be.fulfilled
        await transferManager.join({ from: anotherUser }).should.be.fulfilled

        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 1))
        assert.isOk(await transferManager.verifyTransfer(anotherUser, user, 1))
      })

      describe('#rule: only admin can transfer to everyone', () => {
        beforeEach(async () => {
          await transferManager.addRule(ADMIN_ROLE, NO_ROLES, { from: owner }).should.be.fulfilled
        })

        it('admin can transfer to not joined users ', async () => {
          assert.isOk(await transferManager.verifyTransfer(owner, user, 1))
          assert.isNotOk(await transferManager.verifyTransfer(anotherUser, user, 1))
        })

        it('only admin can transfer to not joined users ', async () => {
          assert.isOk(await transferManager.verifyTransfer(owner, user, 1))
          assert.isNotOk(await transferManager.verifyTransfer(anotherUser, user, 1))
        })
      })

      describe('#rule: users can transfer only to businesses', () => {
        beforeEach(async () => {
          await transferManager.addRule(USER_MASK, BUSINESS_MASK, { from: owner }).should.be.fulfilled
          await transferManager.addEntity(business, BUSINESS_ROLE, { from: owner }).should.be.fulfilled
          await transferManager.join({ from: user }).should.be.fulfilled
        })

        it('user can transfer to business ', async () => {
          assert.isOk(await transferManager.verifyTransfer(user, business, 1))
        })

        it('business cannot transfer to user ', async () => {
          assert.isOk(await transferManager.verifyTransfer(business, user, 1))
        })
      })
    })

    describe('#rule: joined users can tranfer max 10 wei', () => {
      beforeEach(async () => {
        await transferManager.methods['addRule(bytes32,bytes32,bool,uint256)'](USER_ROLE, USER_ROLE, true, 10, { from: owner })

        await transferManager.join({ from: user }).should.be.fulfilled
        await transferManager.join({ from: anotherUser }).should.be.fulfilled
      })

      it('joined users can transfer 5 wei ', async () => {
        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 5))
      })

      it('joined users can transfer 10 wei ', async () => {
        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 10))
      })

      it('joined users cannot transfer nore than 10 wei ', async () => {
        assert.isNotOk(await transferManager.verifyTransfer(user, anotherUser, 11))
      })
    })

    describe('#rule: joined users can tranfer min 10 wei', () => {
      beforeEach(async () => {
        await transferManager.methods['addRule(bytes32,bytes32,bool,uint256)'](USER_ROLE, USER_ROLE, false, 10, { from: owner })

        await transferManager.join({ from: user }).should.be.fulfilled
        await transferManager.join({ from: anotherUser }).should.be.fulfilled
      })

      it('joined users can transfer 5 wei ', async () => {
        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 15))
      })

      it('joined users can transfer 10 wei ', async () => {
        assert.isOk(await transferManager.verifyTransfer(user, anotherUser, 10))
      })

      it('joined users cannot transfer nore than 10 wei ', async () => {
        assert.isNotOk(await transferManager.verifyTransfer(user, anotherUser, 5))
      })
    })
  })
})
