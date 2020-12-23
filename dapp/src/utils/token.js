import MintableBurnableTokenAbi from 'constants/abi/MintableBurnableToken'

export const isOwner = (token, accountAddress) => {
  if (token && token.owner === accountAddress) {
    return true
  }
  return false
}

export function mint ({ tokenAddress, to, amount }, { accountAddress, web3, web3Options }) {
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, web3Options)

  const transactionPromise = contract.methods.mint(to, amount).send({
    from: accountAddress
  })
  return transactionPromise
}

export function burn ({ tokenAddress, amount }, { accountAddress, web3, web3Options }) {
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, web3Options)

  const transactionPromise = contract.methods.burn(amount).send({
    from: accountAddress
  })
  return transactionPromise
}

export function transfer ({ tokenAddress, to, amount }, { accountAddress, web3, web3Options }) {
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, web3Options)

  const transactionPromise = contract.methods.transfer(to, amount).send({
    from: accountAddress
  })
  return transactionPromise
}
