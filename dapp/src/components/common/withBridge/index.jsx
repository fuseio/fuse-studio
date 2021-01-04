import React, { useState } from 'react'
import useInterval from 'hooks/useInterval'
import { REQUEST, PENDING, SUCCESS, FAILURE, DENIED } from 'actions/constants'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
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
    const [blockNumber, setBlockNumber] = useState()
    const [confirmationsLimit, setConfirmationsLimit] = useState()
    const [delay, setDelay] = useState(null)
    const [relayEvent, setRelayEvent] = useState(null)
    const { accountAddress } = network
    const { web3Context } = network
    const { tokenContext } = dashboard
    const { web3: web3Home } = tokenContext
    const { web3: web3Foreign } = web3Context
    const { foreignNetwork, bridgeDirection } = dashboard
    const bridge = dashboard?.bridgeStatus?.from?.bridge
    const bridgeType = dashboard?.community?.bridgeType
    const homeBridgeAddress = dashboard?.community?.homeBridgeAddress
    const foreignBridgeAddress = dashboard?.community?.foreignBridgeAddress

    useInterval(() => {
      if (bridge === 'foreign') {
        fetchHomeBridgePastEvents({
          networkType: foreignNetwork,
          bridgeType,
          transactionHash,
          fromBlock: blockNumber,
          homeBridgeAddress,
          bridgeDirection,
        }, { web3: web3Home }).then((events) => {
          const bridgeEvent = getRelayEventByTransactionHash({ events, accountAddress })
          if (bridgeEvent) {
            setRelayEvent(bridgeEvent)
            setDelay(null)
            onConfirmation()
          }
        })
      } else {
        fetchForeignBridgePastEvents({
          networkType: foreignNetwork,
          bridgeType,
          fromBlock: blockNumber,
          foreignBridgeAddress,
          bridgeDirection,
        }, { web3: web3Foreign }).then((events) => {
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

        if (bridge === 'foreign') {
          const homeBlockNumber = await web3Home.eth.getBlockNumber()
          setBlockNumber(homeBlockNumber)
        } else {
          const foreignBlockNumber = await web3Foreign.eth.getBlockNumber()
          setBlockNumber(foreignBlockNumber)
        }

        promise.on('confirmation', (confirmationNumber) => {
          setConfirmationNumber(confirmationNumber)
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
