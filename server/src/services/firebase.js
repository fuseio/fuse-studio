const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')

let roostAdmin
let localDolarAdmin
let localPayAdmin
let wepyAdmin

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
  } 
  else {
    return admin
  }
}
module.exports = {
  admin,
  getAdmin
}
