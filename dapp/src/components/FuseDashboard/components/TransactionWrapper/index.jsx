import React, { useState } from 'react'
import { REQUEST, PENDING, SUCCESS, FAILURE, DENIED } from 'actions/constants'
import Message from 'components/common/SignMessage'

export default function withTransaction (WrappedComponent) {
  const TransactionWrapper = ({ sendTransaction, onConfirmation, ...rest }) => {
    const [transactionHash, setTransactionHash] = useState()
    const [transactionStatus, setTransactionStatus] = useState()
    const [receipt, setReceipt] = useState()

    const handleMintOrBurnClick = amount => {
      const promise = sendTransaction(amount)
      setTransactionStatus(REQUEST)
      promise.on('transactionHash', transactionHash => {
        setTransactionHash(transactionHash)
        setTransactionStatus(PENDING)
        console.log({ transactionHash })
      })
      promise.on('receipt', receipt => {
        setReceipt(receipt)
        if (Number(receipt.status)) {
          setTransactionStatus(SUCCESS)
          onConfirmation(receipt)
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
    return (
      <>
        <Message
          message={'Pending'}
          isOpen={transactionStatus === REQUEST}
          isDark
        />
        <Message
          message={'Pending'}
          isOpen={transactionStatus === PENDING}
          isDark
          subTitle=''
        />

        <WrappedComponent
          handleMintOrBurnClick={handleMintOrBurnClick}
          transactionStatus={transactionStatus}
          transactionHash={transactionHash}
          receipt={receipt}
          isRequeted={transactionStatus === REQUEST}
          isDenied={transactionStatus === DENIED}
          isPending={transactionStatus === PENDING}
          isConfirmed={transactionStatus === SUCCESS}
          isFailed={transactionStatus === FAILURE}
          clearTransaction={() => {
            setTransactionStatus(null)
            setTransactionHash(null)
            setTransactionHash(null)
          }}
          {...rest}
        />
      </>
    )
  }

  return TransactionWrapper
}
