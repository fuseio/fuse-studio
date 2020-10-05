import React, { useState, useEffect, Fragment } from 'react'
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
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const JoinBonus = ({
  error,
  community,
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
  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[homeTokenAddress]

  const { plugins } = community

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
    return () => { }
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

  const initialValues = React.useMemo(() => ({
    joinBonus: { ...get(plugins, 'joinBonus.joinInfo'), isActive: get(plugins, 'joinBonus.isActive') },
    backupBonus: { ...get(plugins, 'backupBonus.backupInfo'), isActive: get(plugins, 'backupBonus.isActive') },
    inviteBonus: { ...get(plugins, 'inviteBonus.inviteInfo'), isActive: get(plugins, 'inviteBonus.isActive') }
  }), [plugins])

  const balance = balances[homeTokenAddress]

  return (
    community ? <Fragment>
      <div className='join_bonus__header'>
        <h2 className='join_bonus__header__title'>Bonuses</h2>
        &nbsp;<FontAwesome data-tip data-for='Bonuses' name='info-circle' />
        <ReactTooltip className='tooltip__content' id='Bonuses' place='bottom' effect='solid'>
          <div>Please put some tokens into the funder above and then select here the type of bonus and the amount you would like.</div>
        </ReactTooltip>
      </div>
      <div className='join_bonus__wrapper'>
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
          balance={balance ? formatWei(balance, 2, foreignToken.decimals) : 0}
          transferToFunder={transferToFunder}
          funderBalance={funderBalance ? formatWei(funderBalance, 2, foreignToken.decimals) : 0}
        />
        <RewardUserForm
          hasFunderBalance={funderBalance && funderBalance !== '0'}
          setJoinBonus={(amount, isActive) => setBonus('joinBonus', amount, isActive)}
          setBackupBonus={(amount, isActive) => setBonus('backupBonus', amount, isActive)}
          setInviteBonus={(amount, isActive) => setBonus('inviteBonus', amount, isActive)}
          initialValues={initialValues}
        />
      </div>
    </Fragment> : <div />
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
