const web3Instances = {
  home: require('./home').web3,
  foreign: require('./foreign').web3
}
const getWeb3 = ({ bridgeType }) => web3Instances[bridgeType]

module.exports = {
  getWeb3
}
