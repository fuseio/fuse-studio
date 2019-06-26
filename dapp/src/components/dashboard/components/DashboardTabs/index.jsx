import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import Message from 'components/common/Message'
import Tabs from 'components/common/Tabs'
import TransferForm from './../TransferForm'
import MintBurnForm from './../MintBurnForm'
import ActivityContent from './../ActivityContent'
import { FAILURE, SUCCESS } from 'actions/constants'
import EthereumIcon from 'images/ethereum_icon.svg'
import { getLatestDataEntry, dropdownOptions } from 'utils/activity'
import { formatWei } from 'utils/format'
import { isMobileOnly } from 'react-device-detect'

const BalanceAndTotalSupply = ({ symbol, totalSupply, balanceOnEthereum }) => {
  return (
    <div className='balances'>
      <div className='balances__item'>
        <h6 className='balances__item__title'>Balance on Ethereum</h6>
        <div className='balances__item__value'>
          <span className='balances__item__value__icon'><img src={EthereumIcon} /></span>
          <span className='balances__item__value__number'>{balanceOnEthereum}</span>
          <span className='balances__item__value__small'>{symbol}</span>
        </div>
      </div>
      <div className='balances__item'>
        <h6 className='balances__item__title'>Total supply on Ethereum</h6>
        <div className='balances__item__value'>
          <span className='balances__item__value__icon'><img src={EthereumIcon} /></span>
          <span className='balances__item__value__number'>{totalSupply}</span>
          <span className='balances__item__value__small'>{symbol}</span>
        </div>
      </div>
    </div>
  )
}

const initialState = {
  transferMessage: false,
  burnMessage: false,
  mintMessage: false
}

export default ({
  user,
  admin,
  token,
  error,
  balance,
  isMinting,
  isBurning,
  isTransfer,
  lastAction,
  networkType,
  transferSuccess,
  burnSuccess,
  mintSuccess,
  burnSignature,
  mintSignature,
  accountAddress,
  handleTransfer,
  balanceOnEthereum,
  tokenNetworkType,
  transactionStatus,
  transferSignature,
  handleIntervalChange,
  handleMintOrBurnClick,
  clearTransactionStatus
}) => {
  const [state, setState] = useState(initialState)
  const [statsToShow, setStats] = useState('user')

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setState({ ...state, transferMessage: true })
      } else if (burnSuccess) {
        setState({ ...state, burnMessage: true })
      } else if (mintSuccess) {
        setState({ ...state, mintMessage: true })
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setState({ ...state, transferMessage: true })
      } else if (burnSuccess === false) {
        setState({ ...state, burnMessage: true })
      } else if (mintSuccess === false) {
        setState({ ...state, mintMessage: true })
      }
    }
  }, [transactionStatus])

  const { tokenType, symbol, totalSupply } = token

  const {
    transferMessage,
    burnMessage,
    mintMessage
  } = state

  const latestDataEntry = getLatestDataEntry(dropdownOptions[0], statsToShow === 'user' ? user : admin)

  return (
    <Tabs>
      <div label='Stats'>
        <BalanceAndTotalSupply balanceOnEthereum={balanceOnEthereum} symbol={symbol} totalSupply={formatWei(totalSupply, 0)} />
        <div className='transfer-tab__content transfer-tab__content--activities'>
          <ActivityContent showStats={() => setStats('user')} statsToShow={statsToShow} stats={user} userType='user' title='users' handleChange={handleIntervalChange} />
          <ActivityContent showStats={() => setStats('admin')} statsToShow={statsToShow} stats={admin} userType='admin' handleChange={handleIntervalChange} />
        </div>
        {
          isMobileOnly && (
            <div className='grid-x align-justify'>
              <div className='activity__activity__number'>
                <p className='activity__small'>
                  Number of transactions
                </p>
                <p className='activity__number'>
                  {latestDataEntry ? latestDataEntry.totalCount : '0'}
                </p>
              </div>
              <div className='activity__activity__number'>
                <p className='activity__small'>
                  Transactions volume
                </p>
                <p className='activity__number'>
                  {latestDataEntry ? formatWei(latestDataEntry.volume, 0) : '0'}
                </p>
              </div>
            </div>
          )
        }
      </div>
      <div label='Transfer' className={classNames({ 'tab__item--loader': isTransfer || transferSignature })}>
        <div className='transfer-tab'>
          <div className='transfer-tab__balance'>
            <span className='title'>Balance: </span>
            <span className='amount'>{balance}</span>
            <span className='symbol'>{token.symbol}</span>
          </div>
          <hr className='transfer-tab__line' />
          <TransferForm
            error={error}
            balance={balance}
            transferMessage={transferMessage}
            transactionStatus={transactionStatus}
            closeMessage={() => {
              setState({ transferMessage: false })
              clearTransactionStatus(null)
            }}
            handleTransfer={handleTransfer}
          />
        </div>
        <Message message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
        <Message message={'Pending'} isOpen={transferSignature} isDark />
      </div>
      {
        token &&
        tokenType &&
        tokenType === 'mintableBurnable' &&
        networkType !== 'fuse' &&
        <div label='Mint \ Burn' className={classNames({ 'tab__item--loader': (mintSignature || burnSignature) || (isBurning || isMinting) })}>
          <div className='transfer-tab'>
            <div className='transfer-tab__balance'>
              <span className='title'>Balance: </span>
              <span className='amount'>{balance}</span>
              <span className='symbol'>{token.symbol}</span>
            </div>
            <hr className='transfer-tab__line' />
            <MintBurnForm
              error={error}
              balance={balance}
              handleMintOrBurnClick={handleMintOrBurnClick}
              tokenNetworkType={tokenNetworkType}
              token={token}
              lastAction={lastAction}
              accountAddress={accountAddress}
              mintMessage={mintMessage}
              burnMessage={burnMessage}
              transactionStatus={transactionStatus}
              closeMintMessage={() => {
                setState({ mintMessage: false })
                clearTransactionStatus(null)
              }}
              closeBurnMessage={() => {
                setState({ burnMessage: false })
                clearTransactionStatus(null)
              }}
            />
          </div>
          <Message message={'Pending'} isOpen={isBurning || isMinting} isDark subTitle='' />
          <Message message={'Pending'} isOpen={mintSignature || burnSignature} isDark />
        </div>
      }
    </Tabs>
  )
}
