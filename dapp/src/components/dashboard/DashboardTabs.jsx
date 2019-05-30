import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import Message from 'components/common/Message'
import Tabs from 'components/common/Tabs'
import TransferForm from './TransferForm'
import MintBurnForm from './MintBurnForm'
import ActivityContent from './ActivityContent'
import { FAILURE, SUCCESS } from 'actions/constants'

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
  handleTransper,
  tokenNetworkType,
  transactionStatus,
  transferSignature,
  handleIntervalChange,
  handleMintOrBurnClick,
  clearTransactionStatus
}) => {
  const [state, setState] = useState(initialState)

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

  const { tokenType, symbol } = token

  const {
    transferMessage,
    burnMessage,
    mintMessage
  } = state

  return (
    <Tabs>
      <div label='Stats'>
        <div className='transfer-tab__balance'>
          <span className='title'>Balance: </span>
          <span className='amount'>{balance}</span>
          <span className='symbol'>{symbol}</span>
        </div>
        <hr className='transfer-tab__line' />
        <div className='transfer-tab__content'>
          <ActivityContent stats={user} userType='user' title='users' handleChange={handleIntervalChange} />
          <ActivityContent stats={admin} userType='admin' handleChange={handleIntervalChange} />
        </div>
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
            transactionStatus={transactionStatus}
            transferMessage={transferMessage}
            closeMessage={() => {
              setState({ transferMessage: false })
              clearTransactionStatus(null)
            }}
            handleTransper={handleTransper}
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
