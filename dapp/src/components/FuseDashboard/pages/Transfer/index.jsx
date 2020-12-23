import React from 'react'
import { formatWei, toWei } from 'utils/format'
import TransferForm from 'components/FuseDashboard/components/TransferForm'
import capitalize from 'lodash/capitalize'
import { withRouter } from 'react-router'
import { convertNetworkName } from 'utils/network'
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
  const { web3Context } = dashboard
  const balance = web3Context.tokenBalance
  const { token, networkName } = web3Context
  const symbol = token?.symbol

  const handleConfirmation = () => dashboard?.fetchTokenBalances(accountAddress)

  const makeTransfer = ({ to: toField, amount }) =>
    transfer({ tokenAddress, to: toField, amount: toWei(String(amount), decimals) }, web3Context)
  debugger
  return (
    !loading && <>
      <div className='transfer__header'>
        <h2 className='transfer__header__title'>Transfer</h2>
      </div>

      <div className='transfer'>
        <div className='transfer__balance'>
          <span className='title'>My Balance: </span>
          <span className='amount'>{`(${capitalize(convertNetworkName(networkName))}) `}{balance ? formatWei(balance, 2, decimals) : 0}</span>
          <small className='symbol'>{symbol}</small>
        </div>
        <TransferForm
          sendTo={sendTo}
          balance={balance ? formatWei(balance, 2, decimals) : 0}
          sendTransaction={makeTransfer}
          onConfirmation={handleConfirmation}
          pendingText="Your money on it's way"
        />
      </div>
    </>
  )
}

export default withRouter(observer(Transfer))
