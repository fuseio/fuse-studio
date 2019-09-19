const ERC677ReceiverTest = artifacts.require('ERC677ReceiverTest')
const NotERC677ReceiverTest = artifacts.require('NotERC677ReceiverTest')

const truffleAssert = require('truffle-assertions')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

const describeTransferAndCall = (createToken, accounts) => describe('transferAndCall', () => {
  let token, receiver, notReceiver
  let owner = accounts[0]
  let notOwner = accounts[1]

  beforeEach(async () => {
    token = await createToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
    receiver = await ERC677ReceiverTest.new()
    notReceiver = await NotERC677ReceiverTest.new()
  })

  it('calls contractFallback when `to` is contract (and transfers the tokens)', async () => {
    assert.equal(await receiver.from(), ZERO_ADDRESS)
    assert.equal(await receiver.value(), '0')
    assert.equal(await receiver.data(), null)
    assert.equal(await receiver.someVar(), '0')

    const callDoSomething123 = receiver.contract.methods.doSomething(123).encodeABI()

    await truffleAssert.fails(
      token.transferAndCall(token.address, 1e6, callDoSomething123, {from: owner}),
      truffleAssert.ErrorType.REVERT
    )

    await truffleAssert.fails(
      token.transferAndCall(ZERO_ADDRESS, 1e6, callDoSomething123, {from: owner}),
      truffleAssert.ErrorType.REVERT
    )

    const result = await token.transferAndCall(receiver.address, 1e6, callDoSomething123, {from: owner})

    assert.equal(await token.balanceOf(receiver.address), 1e6)
    assert.equal(await token.balanceOf(owner), 0)
    assert.equal(await receiver.from(), owner)
    assert.equal(await receiver.value(), 1e6)
    assert.equal(await receiver.data(), callDoSomething123)
    assert.equal(await receiver.someVar(), '123')
    assert.equal(result.logs.length, 2)
    result.logs.forEach(log => {
      let {from, to, value, data} = log.args
      assert.equal(from, owner)
      assert.equal(to, receiver.address)
      assert.equal(value, 1e6)
      if (data) {
        assert.equal(data, callDoSomething123)
      }
    })
  })

  it('does not call contractFallback when `to` is not a contract (just transfers the tokens)', async () => {
    assert.equal(await receiver.from(), ZERO_ADDRESS)
    assert.equal(await receiver.value(), '0')
    assert.equal(await receiver.data(), null)
    assert.equal(await receiver.someVar(), '0')

    const callDoSomething123 = receiver.contract.methods.doSomething(123).encodeABI()

    const result = await token.transferAndCall(notOwner, 1e6, callDoSomething123, {from: owner})

    assert.equal(await token.balanceOf(notOwner), 1e6)
    assert.equal(await token.balanceOf(owner), 0)
    assert.equal(await receiver.from(), ZERO_ADDRESS)
    assert.equal(await receiver.value(), '0')
    assert.equal(await receiver.data(), null)
    assert.equal(await receiver.someVar(), '0')
    assert.equal(result.logs.length, 2)
    result.logs.forEach(log => {
      let {from, to, value, data} = log.args
      assert.equal(from, owner)
      assert.equal(to, notOwner)
      assert.equal(value, 1e6)
      if (data) {
        assert.equal(data, callDoSomething123)
      }
    })
  })

  it('fail to sends tokens to a contract that does not implement onTokenTransfer method', async () => {
    assert.equal(await notReceiver.from(), ZERO_ADDRESS)
    assert.equal(await notReceiver.value(), '0')
    assert.equal(await notReceiver.data(), null)
    assert.equal(await notReceiver.someVar(), '0')

    const callDoSomething123 = notReceiver.contract.methods.doSomething(123).encodeABI()

    await truffleAssert.fails(
      token.transferAndCall(notReceiver.address, 1e6, callDoSomething123, {from: owner}),
      truffleAssert.ErrorType.REVERT
    )

    assert.equal(await notReceiver.from(), ZERO_ADDRESS)
    assert.equal(await notReceiver.value(), '0')
    assert.equal(await notReceiver.data(), null)
    assert.equal(await notReceiver.someVar(), '0')
  })
})

module.exports = {
  describeConstruction,
  describeTokenURI,
  describeTransferAndCall
}
