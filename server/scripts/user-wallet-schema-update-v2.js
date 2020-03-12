const config = require('config')
const mongoose = require('mongoose')

console.log({ config })

mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).catch((error) => {
  console.error(error)
  process.exit(1)
})

require('../src/models')(mongoose)
const UserWallet = mongoose.model('UserWallet')

run()

async function run () {
  const userWallets = await UserWallet.find()
  console.log(`found ${userWallets.length} user wallets`)
  await Promise.all(userWallets.map(async (userWallet) => {
    const { _id, accountAddress, walletModules } = userWallet
    console.log({ _id, accountAddress, walletModules })
    await UserWallet.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(_id)
      },
      {
        walletOwnerOriginalAddress: accountAddress,
        walletModulesOriginal: walletModules
      }
    )
  }))

  console.log('done')
  process.exit(0)
}
