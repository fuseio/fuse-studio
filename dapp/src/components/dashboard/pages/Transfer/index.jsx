import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { toWei } from 'web3-utils'
import { formatWei } from 'utils/format'
import TransferForm from 'components/dashboard/components/TransferForm'
import { transferToken, clearTransactionStatus } from 'actions/token'
import capitalize from 'lodash/capitalize'
import Message from 'components/common/SignMessage'
import { FAILURE, SUCCESS } from 'actions/constants'
import { withRouter } from 'react-router-dom'
import { balanceOfToken } from 'actions/accounts'

const Transfer = ({
  sendTo,
  error,
  token,
  community,
  balances,
  networkType,
  isTransfer,
  transferToken,
  transferSignature,
  transactionStatus,
  accountAddress,
  transferSuccess,
  clearTransactionStatus,
  balanceOfToken,
  tokenOfCommunityOnCurrentSide
}) => {
  const [transferMessage, setTransferMessage] = useState(false)
  const { homeTokenAddress, foreignTokenAddress } = community

  useEffect(() => {
    balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
  }, [accountAddress])

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

  const { symbol } = token

  const balance = balances[tokenOfCommunityOnCurrentSide]

  const handleTransfer = ({ to: toField, amount }) => {
    transferToken(tokenOfCommunityOnCurrentSide, toField, toWei(String(amount)))
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
          sendTo={sendTo}
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

const mapStateToProps = (state, { match }) => ({
  ...state.screens.token,
  sendTo: match.params.sendTo,
  homeNetwork: state.network.homeNetwork
})

const mapDispatchToProps = {
  transferToken,
  clearTransactionStatus,
  balanceOfToken
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Transfer))
