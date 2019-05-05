const truffleAssert = require('truffle-assertions')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const describeBurnable = (createToken, accounts) => describe('Burnable', () => {
  let token
  let owner = accounts[0]

  beforeEach(async () => {
    token = await createToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
  })

  it('owner can burn his tokens', async () => {
      const result = await token.burn(1e5, {from: owner})
      truffleAssert.eventEmitted(result, 'Transfer',
        ev => ev.from === owner && ev.to === ZERO_ADDRESS
      )
      assert.equal(await token.balanceOf(owner), 9e5)
      assert.equal(await token.totalSupply(), 9e5)
  })

  it('owner cannot burn more than his balance', async () => {
      await truffleAssert.fails(token.burn(1e7, {from: owner}))
      assert.equal(await token.balanceOf(owner), 1e6)
  })
})

module.exports = {
  describeBurnable
}
