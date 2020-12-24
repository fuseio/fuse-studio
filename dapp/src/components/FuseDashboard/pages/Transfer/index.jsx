import React from 'react'
import { formatWei, toWei } from 'utils/format'
import TransferForm from 'components/FuseDashboard/components/TransferForm'
import capitalize from 'lodash/capitalize'
import { withRouter } from 'react-router'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'
import { transfer } from 'utils/token'

const Transfer = ({
  sendTo,
  loading
}) => {
  const { dashboard, network } = useStore()
  const { accountAddress } = network
  const decimals = dashboard?.homeToken?.decimals
  const tokenAddress = dashboard?.homeToken?.address
  const { tokenContext } = dashboard
  const { web3Context } = network
  const balance = tokenContext.tokenBalance
  const { token, tokenNetworkName } = tokenContext
  const symbol = token?.symbol

  const handleConfirmation = () => dashboard?.fetchTokenBalances(accountAddress)

  const makeTransfer = ({ to: toField, amount }) =>
    transfer({ tokenAddress, to: toField, amount: toWei(String(amount), decimals) }, web3Context)
  return (
    !loading && <>
      <div className='transfer__header'>
        <h2 className='transfer__header__title'>Transfer</h2>
      </div>

      <div className='transfer'>
        <div className='transfer__balance'>
          <span className='title'>My Balance: </span>
          <span className='amount'>{`(${capitalize(tokenNetworkName)}) `}{balance ? formatWei(balance, 2, decimals) : 0}</span>
          <small className='symbol'>{symbol}</small>
        </div>
        <TransferForm
          sendTo={sendTo}
          balance={balance ? formatWei(balance, 2, decimals) : 0}
          makeTransaction={makeTransfer}
          desiredNetworkName={tokenNetworkName}
          onConfirmation={handleConfirmation}
          pendingText="Your money on it's way"
        />
      </div>
    </>
  )
}

export default withRouter(observer(Transfer))
