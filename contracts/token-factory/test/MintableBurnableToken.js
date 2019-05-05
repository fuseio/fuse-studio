const MintableBurnableToken = artifacts.require('MintableBurnableToken')
const basicTokenUtils = require('./utils/basic')
const burnableUtils = require('./utils/burnable')

contract('MintableBurnableToken', (accounts) => {

  basicTokenUtils.describeConstruction(MintableBurnableToken.new, accounts)

  basicTokenUtils.describeTokenURI(MintableBurnableToken.new, accounts)

  burnableUtils.describeBurnable(MintableBurnableToken.new, accounts)
})
