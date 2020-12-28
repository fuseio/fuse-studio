import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import BasicHomeBridgeABI from 'constants/abi/BasicHomeBridge'
import BasicForeignBridgeABI from 'constants/abi/BasicForeignBridge'
import HomeMultiAMBErc20ToErc677 from 'constants/abi/HomeMultiAMBErc20ToErc677'
import capitalize from 'lodash/capitalize'
import { toShortName } from 'utils/network'

export const getBridgeMediator = (bridgeType, networkType) => {
  const foreignNetwork = toShortName(networkType)
  const bridgeMediator = bridgeType === 'foreign'
    ? CONFIG.web3.addresses[`${foreignNetwork}`].MultiBridgeMediator
    : CONFIG.web3.addresses.fuse[`MultiBridgeMediator${capitalize(foreignNetwork)}`]
  return bridgeMediator
}

export function approveToken({ networkType, tokenAddress, amount, bridgeType = 'home' }, {
  accountAddress,
  web3
}) {
  const bridgeMediatorAddress = getBridgeMediator(bridgeType, networkType)
  const basicTokenContract = new web3.eth.Contract(BasicTokenABI, tokenAddress)
  const transactionPromise = basicTokenContract.methods.approve(bridgeMediatorAddress, amount).send({
    from: accountAddress
  })
  return transactionPromise
}

export function transferToForeign({
  bridgeType,
  bridgeDirection,
  confirmationsLimit,
  homeTokenAddress,
  homeBridgeAddress,
  networkType,
  amount
}, {
  accountAddress,
  web3,
  web3Options
}) {
  let transactionPromise
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const contract = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      transactionPromise = contract.methods.transfer(homeBridgeAddress, amount).send({
        from: accountAddress
      })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const homeBridgeMediatorAddress = getBridgeMediator('home', networkType)
      const contract = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      transactionPromise = contract.methods.transferAndCall(homeBridgeMediatorAddress, amount, []).send({
        from: accountAddress
      })
    }
    return transactionPromise
  }
}

export function transferToHome({
  bridgeType,
  bridgeDirection,
  confirmationsLimit,
  foreignTokenAddress,
  foreignBridgeAddress,
  networkType,
  amount
}, {
  accountAddress,
  web3,
  web3Options,
}) {
  let transactionPromise
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const basicToken = new web3.eth.Contract(BasicTokenABI, foreignTokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      transactionPromise = basicToken.methods.transfer(foreignBridgeAddress, amount).send({
        from: accountAddress
      })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const foreignBridgeMediator = getBridgeMediator('foreign', networkType)
      const homeBridgeMediator = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      transactionPromise = homeBridgeMediator.methods.relayTokens(foreignTokenAddress, amount).send({
        from: accountAddress
      })
    }
    window.analytics.track('Bridge used', { tokenAddress: foreignTokenAddress, networkType: 'fuse' })
    return transactionPromise
  }
}

export async function fetchForeignBridgePastEvents({
  bridgeType,
  bridgeDirection,
  foreignBridgeAddress,
  networkType,
  fromBlock,
}, {
  web3,
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const bridgeContract = new web3.eth.Contract(BasicForeignBridgeABI, foreignBridgeAddress)
      return bridgeContract.getPastEvents('RelayedMessage', { fromBlock })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const foreignBridgeMediator = getBridgeMediator('foreign', networkType)
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator)
      return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
    }
  }
}

export async function fetchHomeBridgePastEvents({
  bridgeType,
  bridgeDirection,
  homeBridgeAddress,
  networkType,
  fromBlock,
}, {
  web3,
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const bridgeContract = new web3.eth.Contract(BasicHomeBridgeABI, homeBridgeAddress)
      return bridgeContract.getPastEvents('RelayedMessage', { fromBlock })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const homeBridgeMediatorAddress = getBridgeMediator('home', networkType)
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)
      return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
    }
  }
}
