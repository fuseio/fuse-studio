import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { toWei } from 'web3-utils'
import { formatWei } from 'utils/format'
import TransferForm from 'components/dashboard/components/TransferForm'
import { transferToken, clearTransactionStatus } from 'actions/token'
import { getBalances } from 'selectors/accounts'
// import { getTransaction } from 'selectors/transaction'
import capitalize from 'lodash/capitalize'
import Message from 'components/common/Message'
import { FAILURE, SUCCESS } from 'actions/constants'

const Transfer = ({
  error,
  token,
  balances,
  networkType,
  isTransfer,
  transferToken,
  transferSignature,
  transactionStatus,
  transferSuccess
}) => {
  const [transferMessage, setTransferMessage] = useState(false)

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setTransferMessage(true)
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setTransferMessage(true)
      }
    }
  }, [transactionStatus])

  const { address: tokenAddress, symbol } = token

  const balance = balances[tokenAddress]

  const handleTransfer = ({ to: toField, amount }) => {
    transferToken(tokenAddress, toField, toWei(String(amount)))
  }

  return (
    <Fragment>
      <div className='transfer__header'>
        <h2 className='transfer__header__title'>Transfer</h2>
      </div>

      <div className='transfer'>
        <Message message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
        <Message message={'Pending'} isOpen={transferSignature} isDark />

        <div className='transfer__balance'>
          <span className='title'>My Balance: </span>
          <span className='amount'>{`(${capitalize(networkType)}) `}{balance ? formatWei(balance, 0) : 0}</span>
          <small className='symbol'>{symbol}</small>
        </div>
        <TransferForm
          error={error}
          balance={balance ? formatWei(balance, 0) : 0}
          transferMessage={transferMessage}
          transactionStatus={transactionStatus}
          closeMessage={() => {
            setTransferMessage(false)
            clearTransactionStatus(null)
          }}
          handleTransfer={handleTransfer}
        />
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  balances: getBalances(state),
  networkType: state.network.networkType
})

const mapDispatchToProps = {
  transferToken,
  clearTransactionStatus
}

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
