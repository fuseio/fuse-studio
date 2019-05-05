const truffleAssert = require('truffle-assertions')
const basicUtils = require('./utils/basic')
const burnableUtils = require('./utils/burnable')
const mintableUtils = require('./utils/mintable')

const TokenFactory = artifacts.require("TokenFactory")
const BasicToken = artifacts.require('BasicToken')
const MintableBurnableToken = artifacts.require('MintableBurnableToken')

const createTokenWrapper = async (createToken, ...args) => {
  const result = await createToken(...args)
  let tokenAddress
  truffleAssert.eventEmitted(result, 'TokenCreated', (ev) => {
    tokenAddress = ev.token
    return true
  })
  return {tokenAddress, result}
}

contract('TokenFactory', (accounts) => {
  let owner = accounts[0]
  let factory
  let token

  before(async () => {
    factory = await TokenFactory.new()
  })

  describe('Token creation', () => {

    const tokenContracts = {
      basic: {
        createFunctionWrapper: () => factory.createBasicToken,
        tokenType: 0
      },
      mintableBurnable: {
        createFunctionWrapper: () => factory.createMintableBurnableToken,
        tokenType: 1
      }
    }
    // console.log(Object.entries(tokenContracts))
    Object.entries(tokenContracts).forEach(([name, tokenProps]) => {
      let createToken
      describe(`Token creation functionality for ${name}`, () => {
        before(() => {
          createToken = tokenProps.createFunctionWrapper()
        })

        const createBasicToken = async (...args) => {
          const {tokenAddress, result} = await createTokenWrapper(createToken, ...args)
          return await BasicToken.at(tokenAddress)
        }

        basicUtils.describeConstruction(createBasicToken, accounts)

        describe('Create token factory', async () => {
          it('creates token with TokenCreated event', async () => {
            const {result} = await createTokenWrapper(createToken, 'MacCoin', 'MC', 1e6, 'ipfs://hash')
            truffleAssert.eventEmitted(result, 'TokenCreated', (ev) => {
              return ev.issuer === owner && ev.tokenType.toNumber() === tokenProps.tokenType
            })
          })
        })

        describe('Create token validations', () => {
          it ('cannot create token without a name', async () => {
            await truffleAssert.fails(
                createToken('', 'MC', 1e6, 'ipfs://hash'),
                truffleAssert.ErrorType.REVERT
            )
          })

          it ('cannot create token without a symbol', async () => {
            await truffleAssert.fails(
                createToken('MacCoin', '', 1e6, 'ipfs://hash'),
                truffleAssert.ErrorType.REVERT
            )
          })

          it ('cannot create token with 0 supply', async () => {
            await truffleAssert.fails(
                createToken('MacCoin', 'MC', 0, 'ipfs://hash'),
                truffleAssert.ErrorType.REVERT
            )
          })

          it ('can create token without tokenURI', async () => {
            await truffleAssert.passes(
              createToken('MacCoin', 'MC', 1e6, '')
            )
          })
        })
      })
    })
  })

  const createMintableBurnableToken = async (...args) => {
    const {tokenAddress} = await createTokenWrapper(
      factory.createMintableBurnableToken, ...args
    )
    return await MintableBurnableToken.at(tokenAddress)
  }

  burnableUtils.describeBurnable(createMintableBurnableToken, accounts)

  mintableUtils.describeMintable(createMintableBurnableToken, accounts)

  it('should change the minter to the token owner', async () => {
    token = await createMintableBurnableToken('MacCoin', 'MC', 1e6, 'ipfs://hash', {from: owner})
    assert.isOk(await token.isMinter(owner))
    assert.isNotOk(await token.isMinter(factory.address))
  })
})
