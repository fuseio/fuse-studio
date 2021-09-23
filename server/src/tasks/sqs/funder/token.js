const { createNetwork } = require('@utils/web3')
const { transfer } = require('@utils/token')
const { fetchToken, adjustDecimals } = require('@utils/token')
const { notifyReceiver } = require('@services/firebase')
const { validateBonusAlowance } = require('@utils/jobs')

const fundToken = async (account, { phoneNumber, receiverAddress, tokenAddress, communityAddress, bonusType, bonusMaxTimesLimit, bonusAmount }, job) => {
  const network = createNetwork('home', account)
  const { decimals } = await fetchToken(tokenAddress)
  if (!bonusAmount) {
    throw Error(`No bonus of type ${bonusType} defined for community ${communityAddress}.`)
  }

  if (!await validateBonusAlowance({ job, phoneNumber, tokenAddress, communityAddress, receiverAddress, bonusType, bonusMaxTimesLimit })) {
    throw Error(`Bonus type ${bonusType} reached maximum times ${bonusMaxTimesLimit}. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }
  const amountInWei = adjustDecimals(bonusAmount, 0, decimals)
  const receipt = await transfer(network, { from: account.address, to: receiverAddress, tokenAddress, amount: amountInWei }, { job, communityAddress })
  if (receipt.status) {
    notifyReceiver({
      bonusType,
      receiverAddress,
      tokenAddress,
      amountInWei
    }).catch(console.error)
    console.log(`succesfully funded ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
  } else {
    console.warn(`error in funding ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
    console.log({ receipt })
  }
}

module.exports = {
  fundToken
}
