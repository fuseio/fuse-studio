const sendgridUtils = require('@utils/sendgrid')

const onboardUser = async ({ foreign: { web3 } }, communityProgress) => {
  if (web3.eth && web3.eth.net && web3.eth.net.getId) {
    const chainId = await web3.eth.net.getId()
    const { email, subscribe } = communityProgress.steps.email.args
    const { name } = communityProgress.steps.community.args
    const { communityAddress } = communityProgress.steps.community.results
    try {
      const networkType = chainId === 3
        ? 'ropsten' : chainId === 122
          ? 'fuse' : chainId === 1
            ? 'mainnet' : ''
      sendgridUtils.sendInfoMail({ email }, { networkType, communityName: name, communityAddress })
      if (subscribe) {
        sendgridUtils.subscribeUser({ email })
      }
    } catch (error) {
      console.log('email step error', { error })
    }
  }
}

module.exports = {
  onboardUser
}
