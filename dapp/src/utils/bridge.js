import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import BasicHomeBridgeABI from 'constants/abi/BasicHomeBridge'
import BasicForeignBridgeABI from 'constants/abi/BasicForeignBridge'
import HomeMultiAMBErc20ToErc677 from 'constants/abi/HomeMultiAMBErc20ToErc677'
import capitalize from 'lodash/capitalize'
import { toShortName } from 'utils/network'

const isProd = CONFIG.env === 'production'

export const getBridgeMediator = (bridgeType, networkType) => {
  const foreignNetwork = toShortName(networkType)
  const bridgeMediator = bridgeType === 'foreign'
    ? CONFIG.web3.addresses[`${foreignNetwork}`].MultiBridgeMediator
    : CONFIG.web3.addresses.fuse[`MultiBridgeMediator${capitalize(foreignNetwork)}`]
  return bridgeMediator
}

export const homeToForeignBridgeMediators = {
  fuse: isProd
    ? CONFIG.web3.bridge.addresses.homeToForeign.fuse.MultiBridgeMediatorMain
    : CONFIG.web3.bridge.addresses.homeToForeign.fuse.MultiBridgeMediatorRopsten,
  ethereum: isProd
    ? CONFIG.web3.bridge.addresses.homeToForeign.main.MultiBridgeMediator
    : CONFIG.web3.bridge.addresses.homeToForeign.ropsten.MultiBridgeMediator
}

export function approveToken ({
  networkType,
  tokenAddress,
  amount,
  bridgeDirection,
  bridgeType
}, {
  accountAddress,
  web3
}) {
  let bridgeMediator
  if (bridgeDirection === 'foreign-to-home') {
    bridgeMediator = getBridgeMediator(bridgeType, networkType)
  } else if (bridgeDirection === 'home-to-foreign') {
    bridgeMediator = networkType === 'fuse'
      ? homeToForeignBridgeMediators.fuse
      : homeToForeignBridgeMediators.ethereum
  }
  const basicTokenContract = new web3.eth.Contract(BasicTokenABI, tokenAddress)
  const transactionPromise = basicTokenContract.methods.approve(bridgeMediator, amount).send({
    from: accountAddress
  })
  return transactionPromise
}

export function transferToForeign ({
  bridgeType,
  bridgeDirection,
  confirmationsLimit,
  tokenAddress,
  homeBridgeAddress,
  networkType,
  amount
}, {
  accountAddress,
  web3,
  web3Options
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const contract = new web3.eth.Contract(BasicTokenABI, tokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      const transactionPromise = contract.methods.transfer(homeBridgeAddress, amount).send({
        from: accountAddress
      })
      return transactionPromise
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = getBridgeMediator('home', networkType)
      const contract = new web3.eth.Contract(BasicTokenABI, tokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      const transactionPromise = contract.methods.transferAndCall(bridgeMediator, amount, []).send({
        from: accountAddress
      })
      return transactionPromise
    }
  } else if (bridgeDirection === 'home-to-foreign') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = homeToForeignBridgeMediators.ethereum
      const contract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      const transactionPromise = contract.methods.relayTokens(tokenAddress, amount).send({
        from: accountAddress
      })
      return transactionPromise
    }
  }
}

export function transferToHome ({
  bridgeType,
  bridgeDirection,
  confirmationsLimit,
  tokenAddress,
  foreignBridgeAddress,
  networkType,
  amount
}, {
  accountAddress,
  web3,
  web3Options
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const contract = new web3.eth.Contract(BasicTokenABI, tokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      const transactionPromise = contract.methods.transfer(foreignBridgeAddress, amount).send({
        from: accountAddress
      })
      return transactionPromise
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = getBridgeMediator('foreign', networkType)
      const contract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      window.analytics.track('Bridge used', { tokenAddress: tokenAddress, networkType: 'fuse' })
      const transactionPromise = contract.methods.relayTokens(tokenAddress, amount).send({
        from: accountAddress
      })
      return transactionPromise
    }
  } else if (bridgeDirection === 'home-to-foreign') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = homeToForeignBridgeMediators.fuse
      const contract = new web3.eth.Contract(BasicTokenABI, tokenAddress, { ...web3Options, transactionConfirmationBlocks: confirmationsLimit })
      const transactionPromise = contract.methods.transferAndCall(bridgeMediator, amount, []).send({
        from: accountAddress
      })
      return transactionPromise
    }
  }
}

export async function fetchForeignBridgePastEvents ({
  bridgeType,
  bridgeDirection,
  foreignBridgeAddress,
  networkType,
  fromBlock
}, {
  web3
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const bridgeContract = new web3.eth.Contract(BasicForeignBridgeABI, foreignBridgeAddress)
      return bridgeContract.getPastEvents('RelayedMessage', { fromBlock })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = getBridgeMediator('foreign', networkType)
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
    }
  } else if (bridgeDirection === 'home-to-foreign') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = homeToForeignBridgeMediators.fuse
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
    }
  }
}

export async function fetchBridgePastEvents ({
  bridge,
  bridgeType,
  bridgeDirection,
  homeBridgeAddress,
  networkType,
  fromBlock,
  foreignBridgeAddress
}, {
  web3
}) {
  if (bridge === 'foreign') {
    if (bridgeDirection === 'foreign-to-home') {
      if (bridgeType === 'multiple-erc20-to-erc20') {
        const contract = new web3.eth.Contract(BasicHomeBridgeABI, homeBridgeAddress)
        return contract.getPastEvents('RelayedMessage', { fromBlock })
      } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
        const bridgeMediator = getBridgeMediator('home', networkType)
        const contract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
        return contract.getPastEvents('TokensBridged', { fromBlock })
      }
    } else if (bridgeDirection === 'home-to-foreign') {
      if (bridgeType === 'multi-amb-erc20-to-erc677') {
        const bridgeMediator = homeToForeignBridgeMediators.ethereum
        const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
        return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
      }
    }
  } else {
    if (bridgeDirection === 'foreign-to-home') {
      if (bridgeType === 'multiple-erc20-to-erc20') {
        const bridgeContract = new web3.eth.Contract(BasicForeignBridgeABI, foreignBridgeAddress)
        return bridgeContract.getPastEvents('RelayedMessage', { fromBlock })
      } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
        const bridgeMediator = getBridgeMediator('foreign', networkType)
        const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
        return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
      }
    } else if (bridgeDirection === 'home-to-foreign') {
      if (bridgeType === 'multi-amb-erc20-to-erc677') {
        const bridgeMediator = homeToForeignBridgeMediators.fuse
        const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
        return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
      }
    }
  }
}

export async function fetchHomeBridgePastEvents ({
  bridgeType,
  bridgeDirection,
  homeBridgeAddress,
  networkType,
  fromBlock
}, {
  web3
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multiple-erc20-to-erc20') {
      const contract = new web3.eth.Contract(BasicHomeBridgeABI, homeBridgeAddress)
      return contract.getPastEvents('RelayedMessage', { fromBlock })
    } else if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = getBridgeMediator('home', networkType)
      const contract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return contract.getPastEvents('TokensBridged', { fromBlock })
    }
  } else if (bridgeDirection === 'home-to-foreign') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = homeToForeignBridgeMediators.ethereum
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return bridgeContract.getPastEvents('TokensBridged', { fromBlock })
    }
  }
}

export async function fetchHomeNewTokenRegistered ({
  bridgeType,
  bridgeDirection,
  networkType,
  fromBlock
}, {
  web3
}) {
  if (bridgeDirection === 'foreign-to-home') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = getBridgeMediator('home', networkType)
      const contract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return contract.getPastEvents('NewTokenRegistered', { fromBlock })
    }
  } else if (bridgeDirection === 'home-to-foreign') {
    if (bridgeType === 'multi-amb-erc20-to-erc677') {
      const bridgeMediator = homeToForeignBridgeMediators.ethereum
      const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      return bridgeContract.getPastEvents('NewTokenRegistered', { fromBlock })
    }
  }
}
