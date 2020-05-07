const config = require('config')
const mongoose = require('mongoose')
const _ = require('lodash')
const { GraphQLClient } = require('graphql-request')
const graphClient = new GraphQLClient(config.get('graph.url'))

console.log({ config })

mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).catch((error) => {
  console.error(error)
  process.exit(1)
})

require('../src/models')(mongoose)
const UserWallet = mongoose.model('UserWallet')

run()

async function run () {
  const funderAddress = ['0xa6c61e75e6008eed7f75b73c84755558764081d1', '0x373c383b05c121e541f239afe5fd73c013fed20f']
  const forks = {
    Roost: '0xE3393d5167badAAC6D5989612A1354B6Ef55027c',
    LocalDolarMX: '0xe8f18ebE449A8f63435C2f3889AFaEE4625b3Da3',
    LocalPay: '0xEAdC097Efaf4b9994Ef76dB86570a79a24A03Ae5',
    WEPY: '0x66f0821861D08fb374cE5a9CA47685ac81B83551',
    Supervecina: '0xfF4e4B6283dB9e1d4690160a0CF740736E2b3EE8',
    BIM: '0x3132342DFcC632041109eB5854554ACF04D352Ac',
    Bit2C: '0xf22aFE879538878C4DB6de8D4C1eBC78C9051dbf',
    FarmlyLedger: '0x9ce47ff5998CFFEBB65dFd9E4a3e4afC835A9074',
    Seedbed: '0x104bac6FD3778944B733f128644e9AeCA8f0dFbc'
  }
  const getUsers = (communityAddress) => `{communities(where:{address:"${communityAddress}"}) { entitiesList { communityEntities{ address, isUser } } }}`
  const query = (address) => `{wallets(where: {address: "${address}"}) {owner}}`
  for (const appName in forks) {
    const communityAddress = forks[appName]
    console.log({ appName, communityAddress })
    const { communities } = await graphClient.request(getUsers(communityAddress))
    const { entitiesList: { communityEntities } } = communities[0]
    const walletAddresses = communityEntities
      .filter(({ address }) => !funderAddress.includes(address))
      .map(({ address }) => address)
    const accountAddresses = await Promise.all(_.compact(walletAddresses.map(async (address) => {
      const { wallets } = await graphClient.request(query(address))
      if (wallets && wallets[0] && wallets[0].owner) {
        const { owner } = wallets[0]
        return owner
      }
      return false
    })))
    console.log(`found ${accountAddresses.length} account addresses`)
    const userWallets = await UserWallet.find({ accountAddress: { $in: accountAddresses } })
    console.log(`found ${userWallets.length} user wallets`)
    await Promise.all(userWallets.map(async ({ _id, phoneNumber }) => {
      console.log({ phoneNumber })
      await UserWallet.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(_id)
        },
        {
          appName
        }
      )
    }))
  }

  console.log('done')
  process.exit(0)
}
