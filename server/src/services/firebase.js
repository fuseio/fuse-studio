const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')

let roostAdmin
let localDolarAdmin
let localPayAdmin
let wepyAdmin
let supervecinaAdmin
let farmlyledgerAdmin
let bimAdmin
let bit2cAdmin
let localChampionsAdmin
let seedbedAdmin

const initAdmin = async () => {
  const secretsClient = new AWS.SecretsManager(config.aws.secrets.manager)
  const { SecretString } = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretId }).promise()
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(SecretString))
  })
  const roostResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdRoost }).promise()
  roostAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(roostResponse.SecretString))
  }, 'Roost')

  const localDolarResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdLocalDolarMX }).promise()
  localDolarAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(localDolarResponse.SecretString))
  }, 'LocalDollarMX')

  const localPayResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdLocalPay }).promise()
  localPayAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(localPayResponse.SecretString))
  }, 'LocalPay')

  const wepyResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdWepy }).promise()
  wepyAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(wepyResponse.SecretString))
  }, 'WEPY')

  const supervecinaResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdSupervecina }).promise()
  supervecinaAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(supervecinaResponse.SecretString))
  }, 'Supervecina')

  const farmlyledgerResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdFarmlyledger }).promise()
  farmlyledgerAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(farmlyledgerResponse.SecretString))
  }, 'FarmlyLedger')

  const bimResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdBIM }).promise()
  bimAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(bimResponse.SecretString))
  }, 'BIM')

  const bit2cResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdBit2C }).promise()
  bit2cAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(bit2cResponse.SecretString))
  }, 'Bit2C')

  const localChampionsResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdLocalChampions }).promise()
  localChampionsAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(localChampionsResponse.SecretString))
  }, 'LocalChampions')

  const seedBedResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdSeedbed }).promise()
  seedbedAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(seedBedResponse.SecretString))
  }, 'Seedbed')
}

initAdmin()

const getAdmin = (appName) => {
  if (appName === 'Roost') {
    return roostAdmin
  } else if (appName === 'LocalDolarMX') {
    return localDolarAdmin
  } else if (appName === 'LocalPay') {
    return localPayAdmin
  } else if (appName === 'WEPY') {
    return wepyAdmin
  } else if (appName === 'Supervecina') {
    return supervecinaAdmin
  } else if (appName === 'FarmlyLedger') {
    return farmlyledgerAdmin
  } else if (appName === 'BIM') {
    return bimAdmin
  } else if (appName === 'Bit2C') {
    return bit2cAdmin
  } else if (appName === 'LocalChampions') {
    return localChampionsAdmin
  } else if (appName === 'Seedbed') {
    return seedbedAdmin
  } else {
    return admin
  }
}
module.exports = {
  admin,
  getAdmin
}
