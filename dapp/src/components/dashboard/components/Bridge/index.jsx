import React, { useState, useEffect } from 'react'
import get from 'lodash/get'
import Balance from 'components/dashboard/components/Balance'
import Message from 'components/common/SignMessage'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import * as actions from 'actions/bridge'
import { getBlockNumber } from 'actions/network'
import { getBalances } from 'selectors/accounts'
import arrow1 from 'images/arrow--1.svg'
import arrow2 from 'images/arrow--2.svg'
import { convertNetworkName } from 'utils/network'
import { getTransaction } from 'selectors/transaction'
import { loadModal } from 'actions/ui'
import { SHOW_MORE_MODAL } from 'constants/uiConstants'
import FuseLoader from 'images/loader-fuse.gif'
import { formatWei, toWei } from 'utils/format'
import { getBridgeStatus, getHomeNetworkType } from 'selectors/network'

const Bridge = (props) => {
  const [transferAmount, setTransferAmount] = useState('')
  const {
    loadModal,
    balances,
    homeNetwork,
    bridgeStatus,
    symbol,
    decimals,
    transferStatus,
    waitingForConfirmation,
    confirmationNumber,
    confirmationsLimit,
    tokenOfCommunityOnCurrentSide,
    isAdmin,
    community,
    waitingForRelayEvent,
    bridgeSignature,
    tokenName,
    approveSignature,
    allowance,
    approved,
    transferToHome,
    transferToForeign,
    getBlockNumber,
    approveToken,
    foreignTokenAddress,
    homeTokenAddress,
    watchHomeNewTokenRegistered,
    hasHomeTokenInNewBridge,
    watchForeignBridge,
    transactionHash,
    watchHomeBridge
  } = props
  const isTokenApproved = get(approved, tokenOfCommunityOnCurrentSide, false)

  const {
    homeBridgeAddress,
    foreignBridgeAddress
  } = community

  useEffect(() => {
    if (bridgeStatus.to.bridge === 'home' && !hasHomeTokenInNewBridge) {
      watchHomeNewTokenRegistered()
    }
    if (bridgeStatus.to.bridge === 'home' && hasHomeTokenInNewBridge) {
      watchHomeBridge(transactionHash)
    } else {
      watchForeignBridge(transactionHash)
    }
  }, [waitingForConfirmation])

  useEffect(() => {
    if (isTokenApproved) {
      handleTransfer()
      setTransferAmount('')
    }
  }, [approved, tokenOfCommunityOnCurrentSide])

  const balance = balances[tokenOfCommunityOnCurrentSide]
  const formatted = formatWei(balance, 2, decimals)
  const tokenAllowed = get(allowance, tokenOfCommunityOnCurrentSide, new BigNumber(0))
  const allowed = new BigNumber(tokenAllowed).isGreaterThanOrEqualTo(BigNumber(transferAmount || 0).multipliedBy(10 ** decimals))

  const handleApprove = () => {
    const value = toWei(transferAmount, decimals)
    if (bridgeStatus.to.bridge === 'home') {
      approveToken(foreignTokenAddress, value)
    } else {
      approveToken(homeTokenAddress, value, 'home')
    }
  }

  const handleTransfer = () => {
    const value = toWei(transferAmount, decimals)
    if (bridgeStatus.to.bridge === 'home') {
      transferToHome(foreignTokenAddress, value)
    } else {
      transferToForeign(homeTokenAddress, value)
    }
    getBlockNumber(bridgeStatus.to.network, bridgeStatus.to.bridge)
    getBlockNumber(bridgeStatus.from.network, bridgeStatus.from.bridge)
  }

  const openModal = (side) => {
    loadModal(SHOW_MORE_MODAL, {
      name: convertNetworkName(bridgeStatus[side].network),
      network: bridgeStatus[side].network !== 'fuse' ? `https://api.infura.io/v1/jsonrpc/${bridgeStatus[side].network}` : CONFIG.web3.fuseProvider,
      homeTokenAddress,
      foreignTokenAddress,
      homeBridgeAddress,
      foreignBridgeAddress,
      tokenName
    })
  }

  return (
    <div className='content__bridge__wrapper'>
      <div className='content__bridge__container'>
        <Balance
          isAdmin={isAdmin}
          symbol={symbol}
          decimals={decimals}
          balance={balances[homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress]}
          bridgeSide={bridgeStatus.from}
          openModal={() => openModal('from')}
        />
        <div className='bridge__arrow'>
          <img src={homeNetwork === bridgeStatus.from.network ? arrow1 : arrow2} />
        </div>
        <div className='bridge__transfer'>
          <div className='bridge__transfer__form'>
            <input type='number' value={transferAmount} max={formatted} placeholder='0' onChange={(e) => setTransferAmount(e.target.value)} disabled={transferStatus} />
            <div className='bridge__transfer__form__currency'>{symbol}</div>
          </div>
          <button disabled={transferStatus || !Number(transferAmount) || BigNumber(transferAmount).multipliedBy(10 ** decimals).isGreaterThan(new BigNumber(balance))}
            className='bridge__transfer__form__btn' onClick={allowed ? handleTransfer : handleApprove}>
            {
              allowed
                ? (transferStatus || `Transfer to ${bridgeStatus.to.network}`)
                : (transferStatus || `Unlock ${transferAmount} ${symbol}`)
            }
          </button>
        </div>
        <div className='bridge__arrow'>
          <img src={homeNetwork === bridgeStatus.to.network ? arrow1 : arrow2} />
        </div>
        <Balance
          isAdmin={isAdmin}
          symbol={symbol}
          decimals={decimals}
          balance={balances[homeNetwork === bridgeStatus.to.network ? homeTokenAddress : foreignTokenAddress]}
          bridgeSide={bridgeStatus.to}
          openModal={() => openModal('to')}
        />
      </div>

      <Message isOpen={bridgeSignature || approveSignature} isDark />
      {
        waitingForConfirmation
          ? (
            <div className='bridge-deploying'>
              <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
              <p className='bridge-deploying__loader'><img src={FuseLoader} alt='Fuse loader' /></p>
              {confirmationsLimit && <div className='bridge-deploying-confirmation'>
                Confirmations
                <div>{confirmationNumber || '0'} / {confirmationsLimit}</div>
              </div>}
            </div>
          ) : null
      }

      {
        waitingForRelayEvent
          ? (
            <div className='bridge-deploying'>
              <p className='bridge-deploying-text'>Waiting for bridge<span>.</span><span>.</span><span>.</span></p>
              <p className='bridge-deploying__loader'><img src={FuseLoader} alt='Fuse loader' /></p>
            </div>
          ) : null
      }
    </div>
  )
}

const BridgeContainer = (props) => {
  const {
    relayEvent,
    transactionStatus,
    confirmationNumber,
    confirmationsLimit
  } = props
  const isConfirmed = () => confirmationsLimit <= confirmationNumber
  const isSent = () => transactionStatus === 'PENDING' || transactionStatus === 'SUCCESS'

  const isWaitingForConfirmation = () => isSent() && !isConfirmed()

  const getTransferStatus = () => {
    if (transactionStatus === 'PENDING') {
      return 'PENDING'
    }

    if (transactionStatus === 'SUCCESS') {
      if (!isConfirmed()) {
        return 'WAITING FOR CONFIRMATION'
      }
      if (!relayEvent) {
        return 'WAITING FOR BRIDGE'
      }
    }
  }

  return (
    <Bridge
      {...props}
      waitingForConfirmation={isWaitingForConfirmation()}
      transferStatus={getTransferStatus()}
      waitingForRelayEvent={getTransferStatus() === 'WAITING FOR BRIDGE'}
    />
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.bridge,
  homeNetwork: getHomeNetworkType(state),
  balances: getBalances(state),
  bridgeStatus: getBridgeStatus(state),
  hasHomeTokenInNewBridge: state.screens.dashboard.hasHomeTokenInNewBridge,
  ...getTransaction(state, state.screens.bridge.transactionHash)
})

const mapDispatchToProps = {
  ...actions,
  getBlockNumber,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(BridgeContainer)
