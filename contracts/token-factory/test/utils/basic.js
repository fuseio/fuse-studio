const truffleAssert = require('truffle-assertions')

const describeConstruction = (createToken, accounts) => describe('construction', () => {
    let token
    let owner = accounts[0]

    before(async () => {
      token = await createToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
    })

    it('should have correct name', async () => {
        assert.equal(await token.name(), 'MacCoin')
    })

    it('should have correct symbol', async () => {
        assert.equal(await token.symbol(), 'MC')
    })

    it('should have correct total supply', async () => {
        assert.equal(await token.totalSupply(), 1e6)
    })

    it('should have correct tokenURI', async () => {
        assert.equal(await token.tokenURI(), 'ipfs://hash')
    })

    it('should have correct owner', async () => {
        assert.equal(await token.owner(), owner)
    })
})

const describeTokenURI = (createToken, accounts) => describe('tokenURI', () => {
  let token
  let owner = accounts[0]
  let notOwner = accounts[1]

  beforeEach(async () => {
    token = await createToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
  })

  it('owner can change tokenURI of token', async () => {
      const result = await token.setTokenURI('ipfs://newhash', {from: owner})
      truffleAssert.eventEmitted(result, 'TokenURIChanged')
      assert.equal(await token.tokenURI(), 'ipfs://newhash')
  })

  it('now owner cannot change tokenURI of token', async () => {
    await truffleAssert.fails(
        token.setTokenURI('ipfs://newhash', {from: notOwner}),
        truffleAssert.ErrorType.REVERT
    )
    assert.equal(await token.tokenURI(), 'ipfs://hash')
  })
})

module.exports = {
  describeConstruction,
  describeTokenURI
}
