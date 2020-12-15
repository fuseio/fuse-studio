import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { formatWei, toWei } from 'utils/format'
import TransferForm from 'components/dashboard/components/TransferForm'
import { transferToken, clearTransactionStatus } from 'actions/token'
import capitalize from 'lodash/capitalize'
import Message from 'components/common/SignMessage'
import { FAILURE, SUCCESS } from 'actions/constants'
import { withRouter } from 'react-router'
import { getBalances } from 'selectors/accounts'
import { convertNetworkName } from 'utils/network'
import { getCurrentNetworkType } from 'selectors/network'
import { getHomeTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'
import { getCurrentCommunity, getTokenAddressOfByNetwork } from 'selectors/dashboard'

const Transfer = ({
  sendTo,
  error,
  token: { symbol, decimals },
  balances,
  networkType,
  isTransfer,
  transferToken,
  transferSignature,
  transactionStatus,
  transferSuccess,
  clearTransactionStatus,
  tokenOfCommunityOnCurrentSide,
  loading
}) => {
  console.log({ tokenOfCommunityOnCurrentSide })
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
    return () => {}
  }, [transactionStatus])

  const balance = balances[tokenOfCommunityOnCurrentSide]

  const handleTransfer = ({ to: toField, amount }) => {
    transferToken(tokenOfCommunityOnCurrentSide, toField, toWei(String(amount), decimals))
  }

  return (
    !loading && <Fragment>
      <div className='transfer__header'>
        <h2 className='transfer__header__title'>Transfer</h2>
      </div>

      <div className='transfer'>
        <Message message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
        <Message message={'Pending'} isOpen={transferSignature} isDark />

        <div className='transfer__balance'>
          <span className='title'>My Balance: </span>
          <span className='amount'>{`(${capitalize(convertNetworkName(networkType))}) `}{balance ? formatWei(balance, 2, decimals) : 0}</span>
          <small className='symbol'>{symbol}</small>
        </div>
        <TransferForm
          error={error}
          sendTo={sendTo}
          balance={balance ? formatWei(balance, 2, decimals) : 0}
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
  balances: getBalances(state),
  networkType: getCurrentNetworkType(state),
  token: getHomeTokenByCommunityAddress(state, getCommunityAddress(state)) || { symbol: '' },
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, getCurrentCommunity(state))
})

const mapDispatchToProps = {
  transferToken,
  clearTransactionStatus
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Transfer))
