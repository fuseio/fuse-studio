import React, { useState, useEffect } from 'react'
import RewardUserForm from 'components/dashboard/components/RewardUserForm'
import TransferToFunderForm from 'components/dashboard/components/TransferToFunderForm'
import { connect, useSelector } from 'react-redux'
import { transferTokenToFunder, clearTransactionStatus } from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import { FAILURE, SUCCESS } from 'actions/constants'
import { toWei } from 'web3-utils'
import { getFunderAccount, getBalances } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { addCommunityPlugins, toggleJoinBonus } from 'actions/community'
import { loadModal } from 'actions/ui'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import get from 'lodash/get'
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
  addCommunityPlugins,
  clearTransactionStatus,
  balances,
  tokenOfCommunityOnCurrentSide,
  toggleJoinBonus,
  isPortis,
  changeNetwork,
  homeNetwork
}) => {
  useEffect(() => {
    if (isPortis && networkType !== homeNetwork) {
      changeNetwork(homeNetwork)
    }
    return () => { }
  }, [isPortis, networkType])

  useSwitchNetwork(networkType, 'join bonus')

  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[tokenOfCommunityOnCurrentSide]

  const { plugins, communityAddress } = community

  const { joinBonus } = plugins
  const { toSend } = joinBonus

  const [transferMessage, setTransferMessage] = useState(false)

  useEffect(() => {
    balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
    return () => {}
  }, [])

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
    <div className='join_bonus__wrapper'>
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
            hasFunderBalance={funderBalance}
            initialValues={{
              message: get(joinBonus, 'joinInfo.message', ''),
              amount: get(joinBonus, 'joinInfo.amount', ''),
              activated: toSend || false
            }}
            communityAddress={communityAddress}
            toggleJoinBonus={toggleJoinBonus}
            addCommunityPlugins={addCommunityPlugins}
          />
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  homeNetwork: state.network.homeNetwork,
  balances: getBalances(state)
})

const mapDispatchToState = {
  transferTokenToFunder,
  clearTransactionStatus,
  balanceOfToken,
  addCommunityPlugins,
  toggleJoinBonus,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToState)(JoinBonus)
