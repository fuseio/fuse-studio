const { ERROR_MSG, ZERO_ADDRESS, ZERO_BYTES, RANDOM_ADDRESS } = require('./helpers')
const {toBN, toWei, fromWei, toChecksumAddress} = web3.utils

const ERC20Mock = artifacts.require('ERC20Mock.sol')
const ContractMock = artifacts.require('ContractMock.sol')
const Wrapper = artifacts.require('Wrapper.sol')

const DECIMALS = toBN(1e18)

contract('Wrapper', (accounts) => {
  let owner = accounts[0]
  let notOwner = accounts[1]
  let alice = accounts[2]
  let bob = accounts[3]
  let chad = accounts[4]
  let token
  let wrapper

  beforeEach(async () => {
    token = await ERC20Mock.new()
    wrapper = await Wrapper.new()
  })

  describe('construction', () => {
    it('should have correct owner', async () => {
      owner.should.be.equal(await wrapper.owner())
    })
  })

  describe('functionality', () => {
    let amount = toBN(toWei('9', 'ether'))
    let feeAmount = toBN(toWei('1', 'ether'))
    let totalAmount = amount.add(feeAmount)

    beforeEach(async () => {
      // alice gets tokens
      await token.mint(alice, totalAmount)
      totalAmount.should.be.bignumber.equal(await token.balanceOf(alice))

      // alice approves tokens to wrapper address
      await token.approve(wrapper.address, totalAmount, {from: alice})
    })

    it('transferWithFee', async () => {
      // alice transfers to bob, with fee sent to chad
      await wrapper.transferWithFee(token.address, bob, amount, chad, feeAmount, { from: alice }).should.be.fulfilled
      toBN(0).should.be.bignumber.equal(await token.balanceOf(alice))
      amount.should.be.bignumber.equal(await token.balanceOf(bob))
      feeAmount.should.be.bignumber.equal(await token.balanceOf(chad))
      toBN(0).should.be.bignumber.equal(await token.balanceOf(wrapper.address))
    })

    it('transferAndCallWithFee', async () => {
      const mockContract = await ContractMock.new()

      // generate data
      const data = mockContract.contract.methods.method(token.address, bob, amount.toString()).encodeABI()

      // alice calls contract, with fee sent to chad and data transfer amount to bob
      await wrapper.transferAndCallWithFee(token.address, mockContract.address, amount, chad, feeAmount, data, { from: alice }).should.be.fulfilled
      toBN(0).should.be.bignumber.equal(await token.balanceOf(alice))
      amount.should.be.bignumber.equal(await token.balanceOf(bob))
      feeAmount.should.be.bignumber.equal(await token.balanceOf(chad))
      toBN(0).should.be.bignumber.equal(await token.balanceOf(wrapper.address))
    })

    it('approveContractAndCallAnotherContract', async () => {
      const mockContract = await ContractMock.new()

      // generate data
      const data = mockContract.contract.methods.method(token.address, bob, amount.toString()).encodeABI()

      // alice calls contract, with data transfer amount to bob
      await wrapper.approveContractAndCallAnotherContract(token.address, totalAmount, mockContract.address, mockContract.address, data, { from: alice }).should.be.fulfilled
      toBN(0).should.be.bignumber.equal(await token.balanceOf(alice))
      amount.should.be.bignumber.equal(await token.balanceOf(bob))
      totalAmount.sub(amount).should.be.bignumber.equal(await token.balanceOf(wrapper.address))
    })
  })
})
