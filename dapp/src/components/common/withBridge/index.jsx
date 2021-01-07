import React, { useState, useCallback } from 'react'
import useInterval from 'hooks/useInterval'
import get from 'lodash/get'
import { REQUEST, PENDING, SUCCESS, FAILURE, DENIED } from 'actions/constants'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { fetchBridgePastEvents, fetchHomeNewTokenRegistered } from 'utils/bridge'
import { getWeb3 } from 'services/web3'

const getRelayEventByTransactionHash = ({ events, transactionHash, accountAddress }) => {
  for (const ev of events) {
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
    const [newTokenRegisteredDelay, setNewTokenRegisteredDelay] = useState(null)
    const { accountAddress } = network
    const { tokenContext, _web3Foreign } = dashboard
    const { web3: web3Home } = tokenContext
    const { foreignNetwork } = dashboard
    const bridge = dashboard?.bridgeStatus?.from?.bridge
    const networkName = dashboard?.bridgeStatus?.from?.network
    const bridgeType = dashboard?.community?.bridgeType
    const bridgeDirection = dashboard?.community?.bridgeDirection
    const homeBridgeAddress = dashboard?.community?.homeBridgeAddress
    const foreignBridgeAddress = dashboard?.community?.foreignBridgeAddress
    const foreignTokenAddress = dashboard?.community?.foreignTokenAddress

    const fetchPastEvent = useCallback(() => {
      fetchBridgePastEvents({
        bridge,
        networkType: foreignNetwork,
        bridgeType,
        bridgeDirection,
        fromBlock: blockNumber,
        homeBridgeAddress,
        foreignBridgeAddress
      }, {
        web3: networkName !== 'fuse'
          ? getWeb3({ networkType: 'fuse' })
          : getWeb3({ networkType: foreignNetwork })
      }).then((events) => {
        const bridgeEvent = getRelayEventByTransactionHash({ events, accountAddress })
        if (bridgeEvent) {
          if (!foreignTokenAddress && bridge === 'foreign') {
            if (get(bridgeEvent, 'returnValues.token')) {
              dashboard.registerForeignTokenAddress({ foreignTokenAddress: get(bridgeEvent, 'returnValues.token') })
              setNewTokenRegisteredDelay(null)
            }
          }
          setDelay(null)
          onConfirmation()
        }
      })
    }, [
      foreignNetwork,
      bridgeType,
      transactionHash,
      blockNumber,
      homeBridgeAddress,
      bridge,
      bridgeDirection,
      foreignBridgeAddress,
      foreignTokenAddress,
      networkName,
      dashboard?.bridgeStatus
    ])

    const fetchNewTokenRegistered = useCallback(() => {
      fetchHomeNewTokenRegistered({
        bridgeType,
        bridgeDirection,
        fromBlock: blockNumber
      }, {
        web3: getWeb3({ networkType: foreignNetwork })
      }).then((events) => {
        const newTokenRegisteredRelayEvent = getRelayEventByTransactionHash({ events, transactionHash, accountAddress })
        if (newTokenRegisteredRelayEvent) {
          if (get(newTokenRegisteredRelayEvent, 'returnValues.homeToken')) {
            dashboard.registerForeignTokenAddress({ foreignTokenAddress: get(newTokenRegisteredRelayEvent, 'returnValues.homeToken') })
            setNewTokenRegisteredDelay(null)
          }
        }
      })
    }, [
      bridgeType,
      bridgeDirection,
      blockNumber,
      foreignNetwork,
      accountAddress,
      dashboard?.bridgeStatus
    ])

    useInterval(() => {
      fetchNewTokenRegistered()
    }, newTokenRegisteredDelay)

    useInterval(() => {
      fetchPastEvent()
    }, delay)

    const handleSendTransaction = async (submitType, sendTransaction) => {
      const promise = sendTransaction()
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
        } else {
          setTransactionStatus(FAILURE)
        }
      })

      if (submitType === 'transfer') {
        if (networkName !== 'fuse') {
          const homeBlockNumber = await web3Home.eth.getBlockNumber()
          setBlockNumber(homeBlockNumber)
        } else {
          const foreignBlockNumber = await _web3Foreign.eth.getBlockNumber()
          setBlockNumber(foreignBlockNumber)
        }

        setDelay(CONFIG.web3.bridge.pollingTimeout)
        if (!foreignTokenAddress) {
          setNewTokenRegisteredDelay(CONFIG.web3.bridge.pollingTimeout)
        }

        const confirmationsLimit = CONFIG.web3.bridge.confirmations[bridge]
        setConfirmationsLimit(confirmationsLimit)
        promise.on('confirmation', (confirmationNumber) => {
          setConfirmationNumber(confirmationNumber)
        })
      }

      promise.on('error', error => {
        console.log(error)
        const rejected = 'User denied transaction signature'
        setDelay(null)
        setNewTokenRegisteredDelay(null)
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

    const isRequested = transactionStatus === REQUEST
    const isPending = transactionStatus === PENDING
    return (
      <WrappedComponent
        waitingForRelayEvent={!!Number(delay)}
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
