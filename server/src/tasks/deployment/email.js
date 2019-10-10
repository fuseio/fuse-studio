const sendgridUtils = require('@utils/sendgrid')

const onboardUser = async (networks, communityProgress) => {
  const { email, subscribe } = communityProgress.steps.email.args
  try {
    sendgridUtils.sendInfoMail({ email })
    if (subscribe) {
      sendgridUtils.sendWelcomeMail({ email })
      sendgridUtils.subscribeUser({ email })
    }
  } catch (error) {
    console.log('email step error', { error })
  }
}

module.exports = {
  onboardUser
}
