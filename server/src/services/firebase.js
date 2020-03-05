const admin = require('firebase-admin')
const AWS = require('aws-sdk')
const config = require('config')

let roostAdmin

const initAdmin = async () => {
  const secretsClient = new AWS.SecretsManager(config.aws.secrets.manager)
  const { SecretString } = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretId }).promise()
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(SecretString))
  })
  const response = await secretsClient.getSecretValue({ SecretId: config.aws.secrets.firebaseSecretIdRoost }).promise()
  roostAdmin = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(response.SecretString))
  }, 'Roost')
}

initAdmin()

const getAdmin = (appName) => {
  if (appName === 'Roost') {
    return roostAdmin
  } else {
    return admin
  }
}
module.exports = {
  admin,
  getAdmin,
  roostAdmin
}
