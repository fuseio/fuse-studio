import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import TransactionButton from 'components/common/TransactionButton'
import RewardUserForm from 'components/dashboard/components/RewardUserForm'
import { connect, useSelector } from 'react-redux'
import { transferTokenToFunder, clearTransactionStatus } from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import SignMessage from 'components/common/SignMessage'
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
  token: { address, symbol },
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
  toggleJoinBonus
}) => {
  useSwitchNetwork(networkType, 'join bonus')

  const funderAccount = useSelector(getFunderAccount)
  const funderBalance = funderAccount && funderAccount.balances && funderAccount.balances[tokenOfCommunityOnCurrentSide]

  const { plugins, communityAddress } = community

  const { joinBonus } = plugins
  const { toSend } = joinBonus

  const [transferMessage, setTransferMessage] = useState(false)
  const [amountToFunder, setAmount] = useState(null)

  useEffect(() => {
    balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
    return () => {}
  }, [])

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setAmount(null)
        setTransferMessage(true)
        balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setAmount(null)
        setTransferMessage(true)
      }
    }
    return () => {}
  }, [transactionStatus])

  const transferToFunder = () => {
    transferTokenToFunder(tokenOfCommunityOnCurrentSide, toWei(String(amountToFunder)))
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
          {
            !funderBalance
              ? (
                <div className='join_bonus__container'>
                  <div className='join_bonus__balances'>
                    <div className='join_bonus__funder_balance'>
                      <span>My balance:&nbsp;</span>
                      <div>
                        <span>{balance ? formatWei(balance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                    <div className='join_bonus__funder_balance'>
                      <span>Funder balance:&nbsp;</span>
                      <div>
                        <span>{funderBalance ? formatWei(funderBalance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                  </div>
                  <p className='join_bonus__title'>In order to reward your first users please transfer your tokens to the funder, choose how much to send to the funder:</p>
                  <div className='join_bonus__field'>
                    <TextField
                      type='number'
                      placeholder='Insert amount'
                      classes={{
                        root: 'join_bonus__field'
                      }}
                      inputProps={{
                        autoComplete: 'off',
                        value: amountToFunder
                      }}
                      InputProps={{
                        classes: {
                          underline: 'join_bonus__field--underline',
                          error: 'join_bonus__field--error'
                        }
                      }}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className='join_bonus__button'>
                    <TransactionButton frontText='Send' clickHandler={transferToFunder} />
                  </div>

                  <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
                  <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

                  <SignMessage
                    message={'Your money has been sent successfully'}
                    isOpen={transactionConfirmed()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                    subTitle=''
                  />
                  <SignMessage
                    message={'Oops, something went wrong'}
                    subTitle=''
                    isOpen={transactionError()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />

                  <SignMessage
                    message={'Oh no'}
                    subTitle={`You reject the action, That’s ok, try next time!`}
                    isOpen={transactionDenied()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />
                </div>
              ) : (
                <div className='join_bonus__container'>
                  <div className='join_bonus__balances'>
                    <div className='join_bonus__funder_balance'>
                      <span>My balance:&nbsp;</span>
                      <div>
                        <span>{balance ? formatWei(balance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                    <div className='join_bonus__funder_balance'>
                      <span>Funder balance:&nbsp;</span>
                      <div>
                        <span>{funderBalance ? formatWei(funderBalance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                  </div>
                  <div className='join_bonus__field'>
                    <div className='join_bonus__field__add'>Add funder balance:</div>
                    <TextField
                      type='number'
                      placeholder='Insert amount'
                      classes={{
                        root: 'join_bonus__field'
                      }}
                      inputProps={{
                        autoComplete: 'off',
                        value: amountToFunder
                      }}
                      InputProps={{
                        classes: {
                          underline: 'join_bonus__field--underline',
                          error: 'join_bonus__field--error'
                        }
                      }}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className='join_bonus__button'>
                    <TransactionButton frontText='Send' clickHandler={transferToFunder} />
                  </div>

                  <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
                  <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

                  <SignMessage
                    message={'Your money has been sent successfully'}
                    isOpen={transactionConfirmed()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                    subTitle=''
                  />
                  <SignMessage
                    message={'Oops, something went wrong'}
                    subTitle=''
                    isOpen={transactionError()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />

                  <SignMessage
                    message={'Oh no'}
                    subTitle={`You reject the action, That’s ok, try next time!`}
                    isOpen={transactionDenied()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />
                </div>

              )
          }
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
