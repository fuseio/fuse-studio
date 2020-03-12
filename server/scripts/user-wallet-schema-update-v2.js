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
  UserWallet.find()
    .then(userWallets => {
       userWallets.forEach(userWallet => {
         userWallet.walletOwnerOriginalAddress = userWallet.accountAddress
         userWallet.walletModulesOriginal = userWallet.walletModules
         userWallet.save()
       })
       console.log('done')
       process.exit(0)
    })
    .catch(errors => {
      console.error({ errors })
    })
}
