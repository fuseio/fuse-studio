import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import RewardUserForm from 'components/dashboard/components/RewardUserForm'
import TransferToFunderForm from 'components/dashboard/components/TransferToFunderForm'
import { connect, useSelector } from 'react-redux'
import { transferTokenToFunder, clearTransactionStatus } from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import { FAILURE, SUCCESS } from 'actions/constants'
import { getFunderAccount, getBalances } from 'selectors/accounts'
import { formatWei, toWei } from 'utils/format'
import { setBonus } from 'actions/community'
import { loadModal } from 'actions/ui'
import get from 'lodash/get'
import { getCurrentNetworkType } from 'selectors/network'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getHomeTokenAddress, getCurrentCommunity } from 'selectors/dashboard'
import { getCommunityAddress } from 'selectors/entities'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const JoinBonus = ({
  error,
  networkType,
  community,
  homeToken,
  transactionStatus,
  transferSignature,
  isTransfer,
  transferSuccess,
  transferTokenToFunder,
  balanceOfToken,
  clearTransactionStatus,
  balances,
  setBonus,
  homeTokenAddress,
  foreignToken
}) => {
  const { address: communityAddress } = useParams()

  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[homeTokenAddress]

  const { plugins } = community

  const { joinBonus } = plugins

  const [transferMessage, setTransferMessage] = useState(false)

  useEffect(() => {
    if (homeTokenAddress) {
      balanceOfToken(homeTokenAddress, funderAddress, { bridgeType: 'home' })
    }
  }, [homeTokenAddress])

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setTransferMessage(true)
        balanceOfToken(homeTokenAddress, funderAddress, { bridgeType: 'home' })
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setTransferMessage(true)
      }
    }
    return () => {}
  }, [transactionStatus])

  const transferToFunder = (amount) => {
    transferTokenToFunder(homeTokenAddress, toWei(String(amount), foreignToken.decimals))
  }

  const transactionError = () => {
    return transactionStatus && transactionStatus === 'FAILURE' && transferMessage
  }

  const transactionDenied = () => {
    return transactionError() && transferMessage && error && typeof error.includes === 'function' && error.includes('denied')
  }

  const transactionConfirmed = () => {
    return transactionStatus && (transactionStatus === 'SUCCESS' || transactionStatus === 'CONFIRMATION') && transferMessage
  }

  const balance = balances[homeTokenAddress]

  return (
    community ? <div className='join_bonus__wrapper'>
      <div className='join_bonus'>
        <h2 className='join_bonus__main-title join_bonus__main-title--white'>Join bonus</h2>
        <div style={{ position: 'relative' }}>
          <TransferToFunderForm
            isTransfer={isTransfer}
            transferSignature={transferSignature}
            closeInnerModal={() => {
              setTransferMessage(false)
              clearTransactionStatus(null)
            }}
            symbol={foreignToken.symbol}
            transactionConfirmed={transactionConfirmed}
            transactionError={transactionError}
            transactionDenied={transactionDenied}
            balance={balance ? formatWei(balance, 0, foreignToken.decimals) : 0}
            transferToFunder={transferToFunder}
            funderBalance={funderBalance ? formatWei(funderBalance, 0, foreignToken.decimals) : 0}
          />
          <RewardUserForm
            networkType={networkType}
            hasFunderBalance={funderBalance && funderBalance !== '0'}
            initialValues={{
              amount: get(joinBonus, 'joinInfo.amount', '')
            }}
            communityAddress={communityAddress}
            setBonus={(amount) => setBonus('joinBonus', amount)}
            text='How much tokens you want to reward new user community?'
          />
        </div>
      </div>
    </div> : <div />
  )
}

const mapStateToProps = (state, { match }) => ({
  ...state.screens.token,
  balances: getBalances(state),
  networkType: getCurrentNetworkType(state),
  homeTokenAddress: getHomeTokenAddress(state, getCurrentCommunity(state)),
  foreignToken: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)) || { networkType: '' }
})

const mapDispatchToState = {
  transferTokenToFunder,
  clearTransactionStatus,
  balanceOfToken,
  setBonus,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToState)(JoinBonus)
