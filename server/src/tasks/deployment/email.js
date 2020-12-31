const config = require('config')
const { capitalize } = require('lodash')
const sendgridUtils = require('@utils/sendgrid')
const mailchimpUtils = require('@utils/mailchimp')

const onboardUser = async ({ foreign, home }, communityProgress) => {
  const { email, subscribe } = communityProgress.steps.email.args
  const { name } = communityProgress.steps.community.args
  const { communityAddress } = communityProgress.steps.community.results
  try {
    sendgridUtils.sendInfoMail({ email }, { communityName: name, communityAddress })
    if (subscribe) {
      mailchimpUtils.subscribeUser({ email }, [`Studio User ${capitalize(config.get(`network.foreign.name`))}`])
    }
  } catch (error) {
    console.log('email step error', { error })
  }
}

module.exports = {
  onboardUser
}
