const config = require('config')
const mongoose = require('mongoose')

console.log({ config })

mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).catch((error) => {
  console.error(error)
  process.exit(1)
})

require('../src/models')(mongoose)
const UserWallet = mongoose.model('UserWallet')

const homeAddresses = config.get('network.home.addresses')

run()

async function run () {
  const userWallets = await UserWallet.find()
  console.log(`found ${userWallets.length} user wallets`)
  userWallets.forEach(async wallet => {
    await UserWallet.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(wallet._id)
    }, {
      walletFactoryOriginalAddress: homeAddresses.WalletFactory,
      walletFactoryCurrentAddress: homeAddresses.WalletFactory,
      walletImplementationOriginalAddress: homeAddresses.WalletImplementation,
      walletImplementationCurrentAddress: homeAddresses.WalletImplementation,
      walletModules: homeAddresses.walletModules,
      networks: ['fuse']
    })
  })
}
