import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import RewardUserForm from 'components/dashboard/components/RewardUserForm'
import TransferToFunderForm from 'components/dashboard/components/TransferToFunderForm'
import { connect, useSelector } from 'react-redux'
import { transferTokenToFunder, clearTransactionStatus } from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import { FAILURE, SUCCESS } from 'actions/constants'
import { toWei, toChecksumAddress } from 'web3-utils'
import { getFunderAccount, getBalances } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { addCommunityPlugin, toggleJoinBonus } from 'actions/community'
import { loadModal } from 'actions/ui'
import get from 'lodash/get'
import { fetchEntity as fetchEntityApi } from 'services/api/entities'
import { getApiRoot } from 'utils/network'
import isEmpty from 'lodash/isEmpty'
import { checkIsFunderPartOfCommunity } from 'selectors/entities'
import { getCurrentNetworkType } from 'selectors/network'
import { getHomeTokenByCommunityAddress } from 'selectors/token'

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
  addCommunityPlugin,
  clearTransactionStatus,
  balances,
  toggleJoinBonus,
  isFunderPartOfCommunity
}) => {
  const { address: communityAddress } = useParams()
  const [isFunderAdded, setFunderStatus] = React.useState(isFunderPartOfCommunity)

  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[homeToken.address]

  const { plugins } = community

  const { joinBonus } = plugins

  const [transferMessage, setTransferMessage] = useState(false)

  useEffect(() => {
    balanceOfToken(homeToken.address, funderAddress, { bridgeType: 'home' })
    return () => {}
  }, [])

  useEffect(() => {
    setFunderStatus(isFunderPartOfCommunity)
  }, [isFunderPartOfCommunity])

  useEffect(() => {
    (async function checkIfFunderAddedToCommunity () {
      const { data } = await fetchEntityApi(getApiRoot(networkType), { communityAddress, account: toChecksumAddress(funderAddress) })
      setFunderStatus(!isEmpty(data))
    })()
  }, [networkType, communityAddress])

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setTransferMessage(true)
        balanceOfToken(homeToken.address, funderAddress, { bridgeType: 'home' })
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setTransferMessage(true)
      }
    }
    return () => {}
  }, [transactionStatus])

  const transferToFunder = (amount) => {
    transferTokenToFunder(homeToken.address, toWei(String(amount)))
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

  const balance = balances[homeToken.address]

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
            symbol={homeToken.symbol}
            transactionConfirmed={transactionConfirmed}
            transactionError={transactionError}
            transactionDenied={transactionDenied}
            balance={balance ? formatWei(balance, 0) : 0}
            transferToFunder={transferToFunder}
            funderBalance={funderBalance ? formatWei(funderBalance, 0) : 0}
          />
          <RewardUserForm
            networkType={networkType}
            hasFunderBalance={funderBalance}
            initialValues={{
              message: get(joinBonus, 'joinInfo.message', ''),
              amount: get(joinBonus, 'joinInfo.amount', ''),
              activated: isFunderAdded
            }}
            communityAddress={communityAddress}
            toggleJoinBonus={toggleJoinBonus}
            addCommunityPlugin={addCommunityPlugin}
          />
        </div>
      </div>
    </div> : <div />
  )
}

const mapStateToProps = (state, { match }) => ({
  ...state.screens.token,
  balances: getBalances(state),
  isFunderPartOfCommunity: checkIsFunderPartOfCommunity(state),
  networkType: getCurrentNetworkType(state),
  homeToken: getHomeTokenByCommunityAddress(state, match.params.address) || {}
})

const mapDispatchToState = {
  transferTokenToFunder,
  clearTransactionStatus,
  balanceOfToken,
  addCommunityPlugin,
  toggleJoinBonus,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToState)(JoinBonus)
