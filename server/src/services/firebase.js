const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')

const firebaseApps = {
  roost: {
    secret: 'firebaseSecretIdRoost',
    appName: 'Roost'
  },
  localDolar: {
    appName: 'LocalDollarMX',
    secret: 'firebaseSecretIdLocalDolarMX'
  },
  localPay: {
    appName: 'LocalPay',
    secret: 'firebaseSecretIdLocalPay'
  },
  wepy: {
    appName: 'WEPY',
    secret: 'firebaseSecretIdWepy'
  },
  supervecina: {
    appName: 'Supervecina',
    secret: 'firebaseSecretIdSupervecina'
  },
  farmlyledger: {
    appName: 'FarmlyLedger',
    secret: 'firebaseSecretIdFarmlyledger'
  },
  bim: {
    appName: 'BIM',
    secret: 'firebaseSecretIdBIM'
  },
  bit2c: {
    appName: 'Bit2C',
    secret: 'firebaseSecretIdBit2C'
  },
  localChampions: {
    appName: 'LocalChampions',
    secret: 'firebaseSecretIdLocalChampions'
  },
  seedbed: {
    appName: 'Seedbed',
    secret: 'firebaseSecretIdSeedbed'
  },
  digitalRand: {
    appName: 'DigitalRand',
    secret: 'firebaseSecretIdDigitalRand'
  },
  paywise: {
    appName: 'Paywise',
    secret: 'firebaseSecretIdPaywise'
  },
  fcKnudde: {
    appName: 'FCKnudde',
    secret: 'firebaseSecretIdFCKnudde'
  },
  straitsx: {
    appName: 'StraitsX',
    secret: 'firebaseSecretIdStraitsx'
  },
  esol: {
    appName: 'ESOL',
    secret: 'firebaseSecretIdEsol'
  },
  bitazza: {
    appName: 'Bitazza',
    secret: 'firebaseSecretIdBitazza'
  },
  curaDAI: {
    appName: 'CuraDAI',
    secret: 'firebaseSecretIdCuraDAI'
  },
  worldXr: {
    appName: 'WorldXR',
    secret: 'firebaseSecretIdWorldXR'
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

  for (const { appName, secret } of Object.values(firebaseApps)) {
    if (config.aws.secrets.hasOwnProperty(secret)) {
      console.log(`initializing firebase admin for ${appName}`)
      const response = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdRoost }).promise()
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
