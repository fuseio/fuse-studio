import React, { useState, useEffect } from 'react'
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
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import get from 'lodash/get'
import { fetchEntity as fetchEntityApi } from 'services/api/entities'
import { getApiRoot } from 'utils/network'
import isEmpty from 'lodash/isEmpty'
import { checkIsFunderPartOfCommunity } from 'selectors/entities'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const JoinBonus = ({
  error,
  networkType,
  community,
  symbol,
  transactionStatus,
  transferSignature,
  isTransfer,
  transferSuccess,
  transferTokenToFunder,
  balanceOfToken,
  addCommunityPlugin,
  clearTransactionStatus,
  balances,
  tokenOfCommunityOnCurrentSide,
  toggleJoinBonus,
  isFunderPartOfCommunity,
  fetchCommunityData
}) => {
  const [isFunderAdded, setFunderStatus] = React.useState(isFunderPartOfCommunity)

  useSwitchNetwork('fuse', { featureName: 'join bonus' })

  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[tokenOfCommunityOnCurrentSide]

  const { plugins, communityAddress } = community

  const { joinBonus } = plugins

  const [transferMessage, setTransferMessage] = useState(false)

  useEffect(() => {
    balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
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
        balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setTransferMessage(true)
      }
    }
    return () => {}
  }, [transactionStatus])

  const transferToFunder = (amount) => {
    transferTokenToFunder(tokenOfCommunityOnCurrentSide, toWei(String(amount)))
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

  const balance = balances[tokenOfCommunityOnCurrentSide]

  return (
    !fetchCommunityData && <div className='join_bonus__wrapper'>
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
            symbol={symbol}
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
    </div>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  balances: getBalances(state),
  isFunderPartOfCommunity: checkIsFunderPartOfCommunity(state)
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
