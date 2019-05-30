const config = require('config')
const { web3, from, send } = require('@services/web3/home')
const UsersRegistryABI = require('@fuse/entities-contracts/build/abi/UsersRegistry')
const homeAddresses = config.get('network.home.addresses')

const usersRegistryContract = new web3.eth.Contract(UsersRegistryABI, homeAddresses.UsersRegistry)

const addUser = async (account, userUri) => {
  const method = usersRegistryContract.methods.addUser(account, userUri)
  return send(method, {
    from
  })
}

const updateUser = async (account, userUri) => {
  const method = usersRegistryContract.methods.updateUser(account, userUri)
  return send(method, {
    from
  })
}

const upsertUser = async (account, userUri) => {
  const userExists = await usersRegistryContract.methods.users(account).call()
  if (userExists) {
    return updateUser(account, userUri)
  } else {
    return addUser(account, userUri)
  }
}

module.exports = {
  addUser,
  updateUser,
  upsertUser
}
