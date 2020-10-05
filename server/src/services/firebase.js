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
let digitalRandAdmin
let paywiseAdmin
let fcKnuddeAdmin
let straitsxAdmin
let esolAdmin
let bitazzaAdmin
let curaDAIAdmin

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

  const digitalRandResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdDigitalRand }).promise()
  digitalRandAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(digitalRandResponse.SecretString))
  }, 'DigitalRand')

  const paywiseResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdPaywise }).promise()
  paywiseAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(paywiseResponse.SecretString))
  }, 'Paywise')

  const fcKnuddeResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdFCKnudde }).promise()
  fcKnuddeAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fcKnuddeResponse.SecretString))
  }, 'FCKnudde')

  const straitsxResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdStraitsx }).promise()
  straitsxAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(straitsxResponse.SecretString))
  }, 'StraitsX')

  const esolResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdEsol }).promise()
  esolAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(esolResponse.SecretString))
  }, 'ESOL')

  const bitazzaResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdBitazza }).promise()
  bitazzaAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(bitazzaResponse.SecretString))
  }, 'Bitazza')

  const curaDAIResponse = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdCuraDAI }).promise()
  curaDAIAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(curaDAIResponse.SecretString))
  }, 'CuraDAI')
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
  } else if (appName === 'DigitalRand') {
    return digitalRandAdmin
  } else if (appName === 'Paywise') {
    return paywiseAdmin
  } else if (appName === 'FCKnudde') {
    return fcKnuddeAdmin
  } else if (appName === 'StraitsX') {
    return straitsxAdmin
  } else if (appName === 'ESOL') {
    return esolAdmin
  } else if (appName === 'Bitazza') {
    return bitazzaAdmin
  } else if (appName === 'CuraDAI') {
    return curaDAIAdmin
  } else {
    return admin
  }
}
module.exports = {
  admin,
  getAdmin
}
