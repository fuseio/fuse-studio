const config = require('config')
const SimpleListFactoryABI = require('@constants/abi/SimpleListFactory.json')
const SimpleListABI = require('@constants/abi/SimpleList.json')
const homeAddresses = config.get('web3.addresses.fuse')
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')
const { handleReceipt } = require('@events/handlers')
const { web3, from, send } = require('@services/web3/home')

const deployMembersList = async (token, nonces) => {
  console.log('Deploying members list')
  const { homeTokenAddress } = await Bridge.findOne({ foreignTokenAddress: token.address })

  const SimpleListFactoryContract = new web3.eth.Contract(SimpleListFactoryABI, homeAddresses.SimpleListFactory)

  const method = SimpleListFactoryContract.methods.createSimpleList(homeTokenAddress)

  const receipt = await send(method, {
    from
  })

  await handleReceipt(receipt)

  const listAddress = receipt.events.SimpleListCreated.returnValues.list

  console.log(`Deploying members list finished. list address ${listAddress}`)

  const simpleListContract = new web3.eth.Contract(SimpleListABI, listAddress)

  const addAdminMethod = simpleListContract.methods.addAdmin(token.owner)
  await send(addAdminMethod, {
    from
  })

  console.log(`${token.owner} Added as owner of the list`)
  const removeAdminMethod = simpleListContract.methods.removeAdmin(from)
  await send(removeAdminMethod, {
    from
  })

  console.log('list creator is removed from admins list')
}

module.exports = {
  deployMembersList
}
