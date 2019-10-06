const sendgridUtils = require('@utils/sendgrid')

const email = async (networks, communityProgress) => {
  const { email, subscribe } = communityProgress.steps.email.args
  try {
    sendgridUtils.sendInfoMail({ email })
    if (subscribe) {
      sendgridUtils.subscribeUser({ email })
    }
  } catch (error) {
    console.log('email step error', { error })
  }
}

module.exports = {
  email
}
