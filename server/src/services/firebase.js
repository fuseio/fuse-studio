const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')

const firebaseApps = {
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

initAdmins()

const getAdmin = (appName) => firebaseAdmins[appName] || admin

module.exports = {
  admin,
  getAdmin
}
