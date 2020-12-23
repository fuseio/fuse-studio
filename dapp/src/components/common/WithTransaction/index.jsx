import React, { useState } from 'react'
import { REQUEST, PENDING, SUCCESS, FAILURE, DENIED } from 'actions/constants'
import Message from 'components/common/SignMessage'

export default function withTransaction (WrappedComponent) {
  const TransactionWrapper = ({ sendTransaction, onConfirmation, pendingText, ...rest }) => {
    const [transactionHash, setTransactionHash] = useState()
    const [transactionStatus, setTransactionStatus] = useState()
    const [receipt, setReceipt] = useState()

    const handleSendTransaction = amount => {
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

    const isRequested = transactionStatus === REQUEST
    const isPending = transactionStatus === PENDING
    return (
      <>
        <Message message='Pending' isOpen={isRequested} isDark />
        <Message message='Pending' isOpen={isPending} isDark subTitle={pendingText} />

        <WrappedComponent
          handleSendTransaction={handleSendTransaction}
          transactionStatus={transactionStatus}
          transactionHash={transactionHash}
          receipt={receipt}
          isRequested={isRequested}
          isDenied={transactionStatus === DENIED}
          isPending={isPending}
          isConfirmed={transactionStatus === SUCCESS}
          isFailed={transactionStatus === FAILURE}
          clearTransaction={() => {
            setTransactionStatus(null)
            setReceipt(null)
            setTransactionHash(null)
          }}
          {...rest}
        />
      </>
    )
  }

  return TransactionWrapper
}
