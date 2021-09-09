const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')
const get = require('lodash/get')
const mongoose = require('mongoose')
const web3Utils = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')
const { fetchToken } = require('@utils/token')

const firebaseApps = {
  wellBeing: {
    secretKey: 'firebaseSecretIdWellBeing',
    appName: 'WellBeing'
  },
  happyCow: {
    secretKey: 'firebaseSecretIdHappyCow',
    appName: 'HappyCow'
  },
  roost: {
    secretKey: 'firebaseSecretIdRoost',
    appName: 'Roost'
  },
  localDolar: {
    appName: 'LocalDollarMX',
    secretKey: 'firebaseSecretIdLocalDolarMX'
  },
  localPay: {
    appName: 'LocalPay',
    secretKey: 'firebaseSecretIdLocalPay'
  },
  wepy: {
    appName: 'WEPY',
    secretKey: 'firebaseSecretIdWepy'
  },
  supervecina: {
    appName: 'Supervecina',
    secretKey: 'firebaseSecretIdSupervecina'
  },
  farmlyledger: {
    appName: 'FarmlyLedger',
    secretKey: 'firebaseSecretIdFarmlyledger'
  },
  bim: {
    appName: 'BIM',
    secretKey: 'firebaseSecretIdBIM'
  },
  bit2c: {
    appName: 'Bit2C',
    secretKey: 'firebaseSecretIdBit2C'
  },
  localChampions: {
    appName: 'LocalChampions',
    secretKey: 'firebaseSecretIdLocalChampions'
  },
  seedbed: {
    appName: 'Seedbed',
    secretKey: 'firebaseSecretIdSeedbed'
  },
  digitalRand: {
    appName: 'DigitalRand',
    secretKey: 'firebaseSecretIdDigitalRand'
  },
  paywise: {
    appName: 'Paywise',
    secretKey: 'firebaseSecretIdPaywise'
  },
  fcKnudde: {
    appName: 'FCKnudde',
    secretKey: 'firebaseSecretIdFCKnudde'
  },
  straitsx: {
    appName: 'StraitsX',
    secretKey: 'firebaseSecretIdStraitsx'
  },
  esol: {
    appName: 'ESOL',
    secretKey: 'firebaseSecretIdEsol'
  },
  bitazza: {
    appName: 'Bitazza',
    secretKey: 'firebaseSecretIdBitazza'
  },
  curaDAI: {
    appName: 'CuraDAI',
    secretKey: 'firebaseSecretIdCuraDAI'
  },
  worldXr: {
    appName: 'WorldXR',
    secretKey: 'firebaseSecretIdWorldXR'
  },
  fusecash: {
    appName: 'fusecash',
    secretKey: 'firebaseSecretIdFuseCash'
  }
}

const firebaseAdmins = {}

const initAdmins = async () => {
  const secretsClient = new AWS.SecretsManager(config.aws.secrets.manager)
  const { SecretString } = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretId }).promise()
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(SecretString))
  })
  firebaseAdmins.default = admin

  for (const { appName, secretKey } of Object.values(firebaseApps)) {
    if (config.aws.secrets.hasOwnProperty(secretKey)) {
      console.log(`initializing firebase admin for ${appName}`)
      const response = await secretsClient.getSecretValue({ SecretId: config.aws.secrets[secretKey] }).promise()
      const appAdmin = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(response.SecretString))
      }, appName)
      firebaseAdmins[appName] = appAdmin
    } else {
      console.warn(`No firebase data found for ${appName}`)
    }
  }
}

const generateNotifyMessage = ({ amount, symbol, tokenType }) => (tokenType === 'ERC-721' ? {
  title: 'You got a collectable!',
  body: `${symbol} NFT arrived click here to review`
} : {
  title: 'You got funds! 🎉',
  body: `${amount} ${symbol} arrived click here to review`
})

const notifyReceiver = async ({ receiverAddress, tokenAddress, amountInWei, communityAddress, isTopUp = false, tokenType = 'ERC-20' }) => {
  console.log(`notifying receiver ${receiverAddress} for token ${tokenAddress} transfer`)
  const receiverWallet = await UserWallet.findOne({ walletAddress: web3Utils.toChecksumAddress(receiverAddress) })
  const firebaseTokens = get(receiverWallet, 'firebaseTokens')
  if (firebaseTokens) {
    const { symbol } = await fetchToken(tokenAddress)
    const amount = web3Utils.fromWei(String(amountInWei))
    let messages = firebaseTokens.map((token) => ({
      notification: generateNotifyMessage({ amount, symbol, tokenType }),
      token
    }))
    if (!get(receiverWallet, 'appName')) {
      try {
        messages = messages.map((message) => ({
          ...message,
          data: {
            communityAddress,
            isTopUp,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        }))
      } catch (error) {
        console.log(`Error while fetching community address for ${tokenAddress} from the graph ${error}`)
      }
    }
    console.log(`Sending tokens receive push message to ${receiverWallet.phoneNumber} ${receiverAddress}`)
    getAdmin(get(receiverWallet, 'appName')).messaging().sendAll(messages)
  } else {
    console.warn(`No firebase token found for ${receiverAddress} wallet address`)
  }
}

initAdmins()

const getAdmin = (appName) => firebaseAdmins[appName] || admin

module.exports = {
  admin,
  notifyReceiver,
  getAdmin
}
