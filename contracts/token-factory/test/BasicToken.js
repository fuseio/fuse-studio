const BasicToken = artifacts.require('BasicToken')
const basicTokenUtils = require('./utils/basic')

contract('BasicToken', (accounts) => {

  basicTokenUtils.describeConstruction(BasicToken.new, accounts)

  basicTokenUtils.describeTokenURI(BasicToken.new, accounts)
})
