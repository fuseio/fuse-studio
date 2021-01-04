import React, { useEffect } from 'react'
import RewardUserForm from 'components/FuseDashboard/components/RewardUserForm'
import TransferToFunderForm from 'components/FuseDashboard/components/TransferToFunderForm'
import { useSelector, useDispatch } from 'react-redux'
import { balanceOfToken } from 'actions/accounts'
import { getFunderAccount } from 'selectors/accounts'
import { formatWei, toWei } from 'utils/format'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { transfer } from 'utils/token'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const Bonuses = () => {
  const dispatch = useDispatch()
  const funderAccount = useSelector(getFunderAccount)
  const { dashboard, network } = useStore()
  const { accountAddress } = network
  const { tokenContext } = dashboard
  const { web3Context } = network
  const { networkName } = web3Context
  const { tokenNetworkName, tokenBalance } = tokenContext
  const decimals = dashboard?.homeToken?.decimals
  const tokenAddress = dashboard?.homeToken?.address
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[tokenAddress]

  useEffect(() => {
    if (tokenAddress) {
      dispatch(balanceOfToken(tokenAddress, funderAddress, { bridgeType: 'home' }))
    }
  }, [dashboard?.homeToken?.address])

  const makeTransfer = (amount) => {
    return transfer({ tokenAddress, to: funderAddress, amount: toWei(String(amount), decimals) }, web3Context)
  }

  const handleConfirmation = () => {
    dashboard?.fetchTokenBalances(accountAddress)
    dispatch(balanceOfToken(tokenAddress, funderAddress, { bridgeType: 'home' }))
  }

  return (
    dashboard?.community
      ? (
        <>
          <div className='join_bonus__header'>
            <h2 className='join_bonus__header__title'>Bonuses</h2>
            &nbsp;<FontAwesome data-tip data-for='Bonuses' name='info-circle' />
            <ReactTooltip className='tooltip__content' id='Bonuses' place='bottom' effect='solid'>
              <div>Please put some tokens into the funder above and then select here the type of bonus and the amount you would like.</div>
            </ReactTooltip>
          </div>
          <div className='join_bonus__wrapper'>
            <TransferToFunderForm
              desiredNetworkName={tokenNetworkName}
              symbol={dashboard?.homeToken?.symbol}
              balance={tokenBalance ? formatWei(tokenBalance, 2, decimals) : 0}
              makeTransaction={makeTransfer}
              tokenNetworkType={networkName}
              onConfirmation={handleConfirmation}
              funderBalance={funderBalance ? formatWei(funderBalance, 2, decimals) : 0}
            />
            <RewardUserForm
              hasFunderBalance={funderBalance && funderBalance !== '0'}
              setJoinBonus={(amount, isActive) => dashboard?.setBonus('joinBonus', amount, isActive)}
              setBackupBonus={(amount, isActive) => dashboard?.setBonus('backupBonus', amount, isActive)}
              setInviteBonus={(amount, isActive) => dashboard?.setBonus('inviteBonus', amount, isActive)}
            />
          </div>
        </>
      )
      : <div />
  )
}

export default observer(Bonuses)
