import React, { useState, useCallback } from 'react'
import useInterval from 'hooks/useInterval'
import { REQUEST, PENDING, SUCCESS, FAILURE, DENIED } from 'actions/constants'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { getWeb3 } from 'services/web3'
import { fetchForeignBridgePastEvents, fetchHomeBridgePastEvents } from 'utils/bridge'

const getRelayEventByTransactionHash = ({ events, transactionHash, accountAddress }) => {
  for (let ev of events) {
    if ((ev?.returnValues?.transactionHash === transactionHash) || (ev?.returnValues?.recipient === accountAddress)) {
      return ev
    }
  }
}

export default function withBridge(WrappedComponent) {
  const BridgeWrapper = ({ desiredNetworkName, onConfirmation, ...rest }) => {
    const { dashboard, network } = useStore()
    const [transactionHash, setTransactionHash] = useState()
    const [transactionStatus, setTransactionStatus] = useState()
    const [confirmationNumber, setConfirmationNumber] = useState()
    const [receipt, setReceipt] = useState()
    const [blockNumbers, setBlockNumbers] = useState()
    const [confirmationsLimit, setConfirmationsLimit] = useState()
    const [delay, setDelay] = useState(null)
    const [relayEvent, setRelayEvent] = useState(null)
    const { homeNetwork, accountAddress } = network
    const foreignNetwork = dashboard.foreignNetwork
    const bridgeDirection = dashboard.bridgeDirection ?? 'foreign-to-home'
    const bridge = dashboard?.bridgeStatus?.from?.bridge
    const bridgeTo = dashboard?.bridgeStatus?.to?.bridge
    const bridgeType = dashboard?.community?.bridgeType
    const homeBridgeAddress = dashboard?.community?.homeBridgeAddress
    const foreignBridgeAddress = dashboard?.community?.foreignBridgeAddress

    useInterval(() => {
      if (bridgeTo === 'home') {
        const web3 = getWeb3({ networkType: homeNetwork })
        fetchHomeBridgePastEvents({
          networkType: foreignNetwork,
          bridgeType,
          transactionHash,
          fromBlock: blockNumbers.home,
          homeBridgeAddress,
          bridgeDirection,
        }, { web3 }).then((events) => {
          const bridgeEvent = getRelayEventByTransactionHash({ events, accountAddress })
          if (bridgeEvent) {
            setRelayEvent(bridgeEvent)
            setDelay(null)
            onConfirmation()
          }
        })
      } else {
        const web3 = getWeb3({ networkType: foreignNetwork })
        fetchForeignBridgePastEvents({
          networkType: foreignNetwork,
          bridgeType,
          fromBlock: blockNumbers.foreign,
          foreignBridgeAddress,
          bridgeDirection,
        }, { web3 }).then((events) => {
          const bridgeEvent = getRelayEventByTransactionHash({ events, transactionHash, accountAddress })
          if (bridgeEvent) {
            setRelayEvent(bridgeEvent)
            setDelay(null)
            onConfirmation()
          }
        })
      }
    }, delay)

    const handleSendTransaction = async (submitType, sendTransaction) => {
      const promise = sendTransaction()
      if (submitType === 'transfer') {
        setConfirmationsLimit(
          bridge === 'foreign'
            ? CONFIG.web3.bridge.confirmations.foreign
            : CONFIG.web3.bridge.confirmations.home
        )
        promise.on('confirmation', (confirmationNumber) => {
          setConfirmationNumber(confirmationNumber)
        })

        const _web3Home = getWeb3({ networkType: homeNetwork })
        const _web3Foreign = getWeb3({ networkType: foreignNetwork })
        const homeBlockNumber = await _web3Home.eth.getBlockNumber()
        const foreignBlockNumber = await _web3Foreign.eth.getBlockNumber()
        setBlockNumbers({
          home: homeBlockNumber,
          foreign: foreignBlockNumber
        })
      }
      setTransactionStatus(REQUEST)
      promise.on('transactionHash', transactionHash => {
        setTransactionHash(transactionHash)
        setTransactionStatus(PENDING)
      })

      promise.on('receipt', receipt => {
        setReceipt(receipt)
        if (Number(receipt.status)) {
          setTransactionStatus(SUCCESS)
          onConfirmation()
          if (submitType === 'transfer') {
            setDelay(CONFIG.web3.bridge.pollingTimeout)
          }
        } else {
          setTransactionStatus(FAILURE)
        }
      })

      promise.on('error', error => {
        console.log(error)
        const rejected = 'User denied transaction signature'
        if (
          (typeof error === 'string' && error.includes(rejected)) ||
          (typeof error.message === 'string' &&
            error.message.includes(rejected))
        ) {
          setTransactionStatus(DENIED)
        } else {
          setTransactionStatus(FAILURE)
        }
      })
    }

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

    const isRequested = transactionStatus === REQUEST
    const isPending = transactionStatus === PENDING
    return (
      <WrappedComponent
        waitingForRelayEvent={getTransferStatus() === 'WAITING FOR BRIDGE'}
        waitingForConfirmation={isWaitingForConfirmation()}
        handleSendTransaction={handleSendTransaction}
        transactionStatus={transactionStatus}
        transactionHash={transactionHash}
        receipt={receipt}
        confirmationsLimit={confirmationsLimit}
        isRequested={isRequested}
        isDenied={transactionStatus === DENIED}
        isPending={isPending}
        isConfirmed={transactionStatus === SUCCESS}
        isFailed={transactionStatus === FAILURE}
        confirmationNumber={confirmationNumber}
        clearTransaction={() => {
          setTransactionStatus(null)
          setReceipt(null)
          setTransactionHash(null)
        }}
        {...rest}
      />
    )
  }

  return observer(BridgeWrapper)
}
