require('dotenv').config()

const Wrapper = artifacts.require('./Wrapper.sol')

const { DAI_ADDRESS, COMPOUND_ADDRESS } = process.env

module.exports = (deployer, network, accounts) => {
  if (network !== 'test') {
    deployer.then(async function() {
      let wrapper = await Wrapper.new()
      console.log(`Wrapper: ${wrapper.address}`)
    }).catch(function(error) {
      console.error(error)
    })
  }
}
