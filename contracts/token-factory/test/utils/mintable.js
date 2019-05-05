const truffleAssert = require('truffle-assertions')

const describeMintable = (createToken, accounts) =>  describe('Mintable', () => {
  let token
  let owner = accounts[0]

  before(async () => {
    token = await createToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
  })

  it('owner can mint tokens', async () => {
    await truffleAssert.passes(
      token.mint(accounts[1], 1e3, {from: owner})
    )
    assert.equal(await token.balanceOf(accounts[1]), 1e3)
  })

  it('not owner cannot mint tokens', async () => {
    const notOwner = accounts[2]
    await truffleAssert.reverts(
      token.mint(accounts[1], 1e3, {from: notOwner})
    )
    assert.equal(await token.balanceOf(notOwner), 0)
  })
})

module.exports = {
  describeMintable
}
