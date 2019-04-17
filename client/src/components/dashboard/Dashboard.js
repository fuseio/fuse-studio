import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchToken, fetchTokenStatistics, transferToken, mintToken, burnToken } from 'actions/token'
import { isUserExists } from 'actions/user'
import { getClnBalance, getAccountAddress, getBalances } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { USER_DATA_MODAL, WRONG_NETWORK_MODAL, BUSINESS_LIST_MODAL, BRIDGE_MODAL, NO_DATA_ABOUT_OWNER_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import { createList } from 'actions/directory'
import TokenProgress from './TokenProgress'
import TopNav from 'components/TopNav'
import Breadcrumbs from 'components/elements/Breadcrumbs'
import ActivityContent from './ActivityContent'
import Bridge from './Bridge'
import EntityDirectory from './EntityDirectory'
import { isOwner } from 'utils/token'
import Tabs from 'components/common/Tabs'
import classNames from 'classnames'
import upperCase from 'lodash/upperCase'
import web3 from 'web3'
import {getTransaction} from 'selectors/transaction'
import Message from './Message.jsx'

const LOAD_USER_DATA_MODAL_TIMEOUT = 2000
const ERROR_MESSAGE = 'Oops, something went wrong'

class UserDataModal extends React.Component {
  componentDidMount (prevProps) {
    if (this.props.token.owner === this.props.accountAddress && !this.props.userExists) {
      this.timerId = setTimeout(this.props.loadUserDataModal, LOAD_USER_DATA_MODAL_TIMEOUT)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.timerId)
  }

  render = () => null
}

UserDataModal.propTypes = {
  token: PropTypes.object.isRequired,
  accountAddress: PropTypes.string.isRequired,
  loadUserDataModal: PropTypes.func.isRequired,
  userExists: PropTypes.bool
}

class Dashboard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      actionType: null,
      transfer: {
        toField: null,
        amount: null
      },
      mintBurnAmount: '',
      showMessage: null,
      lastAction: {}
    }
  }

  handleIntervalChange = (userType, intervalValue) => {
    this.props.fetchTokenStatistics(this.props.tokenAddress, userType, intervalValue)
  }

  componentDidMount () {
    if (!this.props.token) {
      this.props.fetchToken(this.props.tokenAddress)
    }
    if (this.props.accountAddress) {
      this.props.isUserExists(this.props.accountAddress)
    }
    if (this.props.networkType !== 'fuse' && this.props.tokenNetworkType !== this.props.networkType) {
      this.props.loadModal(WRONG_NETWORK_MODAL, {supportedNetworks: [this.props.tokenNetworkType], handleClose: this.showHomePage})
    }
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate (prevProps) {
    if (this.props.dashboard.informationAdded && !prevProps.dashboard.informationAdded) {
      this.props.hideModal()
    }

    if (this.props.accountAddress && !prevProps.accountAddress) {
      this.props.isUserExists(this.props.accountAddress)
    }

    if (this.props.transactionStatus === 'SUCCESS' && (!prevProps.transactionStatus || prevProps.transactionStatus === 'PENDING')) {
      this.setState({
        ...this.state,
        transfer: {
          toField: null,
          amount: null
        },
        mintBurnAmount: '',
        actionType: null
      })
    }
  }
  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.content && !this.content.contains(event.target)) {
      this.setState({dropdownOpen: ''})
    }
  }

  showHomePage = () => {
    this.props.history.push('/')
  }

  loadUserDataModal = () => {
    if (isOwner(this.props.token, this.props.accountAddress)) {
      this.props.loadModal(USER_DATA_MODAL, { tokenAddress: this.props.tokenAddress })
    } else {
      this.props.loadModal(NO_DATA_ABOUT_OWNER_MODAL, { tokenAddress: this.props.tokenAddress })
    }
  }

  loadBridgePopup = () => this.props.loadModal(BRIDGE_MODAL, {
    tokenAddress: this.props.tokenAddress,
    isOwner: isOwner(this.props.token, this.props.accountAddress),
    buttonAction: this.props.deployBridge
  })

  onlyOnFuse = (successFunc) => {
    if (this.props.networkType === 'fuse') {
      successFunc()
    } else {
      this.props.loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['fuse'] })
    }
  }

  handleMintOrBurn = actionType =>
    this.setState({ actionType })

  onChange = (mintBurnAmount) => {
    const {actionType} = this.state
    if (!actionType) {
      return
    }
    this.setState({ mintBurnAmount })
  }

  loadBusinessListPopup = () => {
    this.onlyOnFuse(() => {
      this.props.loadModal(BUSINESS_LIST_MODAL, {
        tokenAddress: this.props.tokenAddress,
        isOwner: isOwner(this.props.token, this.props.accountAddress),
        buttonAction: this.props.createList
      })
    })
  }

  handleToField = toField => {
    const {transfer: {...data}} = this.state
    this.setState({ transfer: { ...data, toField } })
  }

  handleAmountField = amount => {
    const {transfer: {...data}} = this.state
    this.setState({ transfer: { ...data, amount } })
  }

  handleMintOrBurnClick = () => {
    const { burnToken, mintToken, tokenAddress } = this.props
    const {actionType, mintBurnAmount} = this.state

    if (actionType === 'mint') {
      mintToken(tokenAddress, web3.utils.toWei(String(mintBurnAmount)))
    } else {
      burnToken(tokenAddress, web3.utils.toWei(String(mintBurnAmount)))
    }

    this.setState({ ...this.state, lastAction: { actionType, mintBurnAmount } })
  }

  handleTransper = () => {
    const { transferToken, tokenAddress } = this.props
    const { transfer: { toField, amount } } = this.state
    transferToken(tokenAddress, toField, web3.utils.toWei(String(amount)))
  }

  closeMessage = () => {
    this.setState({ showMessage: false })
  }

  isShow = () => {
    const { transactionStatus } = this.props
    return transactionStatus && (transactionStatus === 'SUCCESS' || transactionStatus === 'CONFIRMATION') && this.state.showMessage !== false
  }

  isError = () => {
    const { transactionStatus } = this.props
    return transactionStatus && transactionStatus === 'FAILURE' && this.state.showMessage !== false
  }

  render () {
    if (!this.props.token) {
      return null
    }
    const { actionType, mintBurnAmount, lastAction } = this.state
    const { token, accountAddress, balances, tokenAddress, dashboard, isTransfer, isMinting, isBurning, networkType, tokenNetworkType, signatureNeeded } = this.props

    const { tokenType } = token
    const balance = balances[tokenAddress]
    const { admin, user, steps } = dashboard
    return [
      <TopNav
        key={0}
        active
        history={this.props.history}
      />,
      <div key={1} className='dashboard-content'>
        <Breadcrumbs breadCrumbsText={token.name} setToHomepage={this.showHomePage} />
        <div className={`dashboard-container ${networkType}`}>
          <div className='dashboard-section'>
            <TokenProgress
              token={token}
              networkType={tokenNetworkType}
              metadata={this.props.metadata}
              steps={steps}
              tokenAddress={this.props.tokenAddress}
              tokenNetworkType={this.props.tokenNetworkType}
              match={this.props.match}
              loadBridgePopup={this.loadBridgePopup}
              loadUserDataModal={this.loadUserDataModal}
              loadBusinessListPopup={this.loadBusinessListPopup}
            />
            <Tabs>
              <div label='Stats' className='tab__item'>
                <div className='transfer-tab__balance'>
                  <span className='title'>Balance: </span>
                  <span className='amount'>{balance ? formatWei(balance, 0) : 0}</span>
                  <span className='symbol'>{token.symbol}</span>
                </div>
                <hr className='transfer-tab__line' />
                <div className='transfer-tab__content' ref={content => (this.content = content)}>
                  <ActivityContent stats={user} userType='user' title='users' handleChange={this.handleIntervalChange} />
                  <ActivityContent stats={admin} userType='admin' handleChange={this.handleIntervalChange} />
                </div>
              </div>
              <div label='Transfer' className='tab__item'>
                <div className='transfer-tab'>
                  <div className='transfer-tab__balance'>
                    <span className='title'>Balance: </span>
                    <span className='amount'>{balance ? formatWei(balance, 0) : 0}</span>
                    <span className='symbol'>{token.symbol}</span>
                  </div>
                  <hr className='transfer-tab__line' />
                  <div className='transfer-tab__content'>

                    <Message message={'Your money has been sent successfully'} isOpen={this.isShow()} clickHandler={this.closeMessage} timeout={2500} />
                    <Message message={ERROR_MESSAGE} isOpen={this.isError()} clickHandler={this.closeMessage} timeout={2500} />

                    <div className='transfer-tab__content__to-field'>
                      <span className='transfer-tab__content__to-field__text'>To</span>
                      <input className='transfer-tab__content__to-field__input' onChange={(e) => this.handleToField(e.target.value)} />
                    </div>
                    <div className='transfer-tab__content__amount'>
                      <span className='transfer-tab__content__amount__text'>Amount</span>
                      <input className='transfer-tab__content__amount__field' placeholder='...' onChange={(e) => this.handleAmountField(e.target.value)} />

                    </div>

                    <div className='transfer-tab__content__button'>
                      <button onClick={this.handleTransper}>SEND</button>
                    </div>
                  </div>
                </div>
                {
                  isTransfer
                    ? (
                      <div className='bridge-deploying'>
                        <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                        <div className='bridge-deploying-confirmation'>{`Your money on it's way`}</div>
                      </div>
                    ) : null
                }
                {
                  signatureNeeded
                    ? (
                      <div className='bridge-deploying'>
                        <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                        <div className='bridge-deploying-confirmation'>{`Waiting for signing`}</div>
                      </div>
                    ) : null
                }
              </div>

              {
                token && tokenType && tokenType === 'mintableBurnable' &&
                <div label='Mint \ Burn' className='tab__item'>
                  <div className='transfer-tab'>
                    <div className='transfer-tab__balance'>
                      <span className='title'>Balance: </span>
                      <span className='amount'>{balance ? formatWei(balance, 0) : 0}</span>
                      <span className='symbol'>{token.symbol}</span>
                    </div>
                    <hr className='transfer-tab__line' />
                    <div className='transfer-tab__content'>
                      <Message message={`Your just ${lastAction.actionType}ed ${lastAction.mintBurnAmount} ${token.symbol} on ${tokenNetworkType} network`} isOpen={this.isShow()} clickHandler={this.closeMessage} />
                      <Message message={ERROR_MESSAGE} isOpen={this.isError()} clickHandler={this.closeMessage} />
                      <div className='transfer-tab__actions'>
                        <button disabled={!isOwner(token, accountAddress)} className={classNames('transfer-tab__actions__btn', { 'transfer-tab__actions__btn--active': actionType === 'mint' })} onClick={() => this.handleMintOrBurn('mint')}>Mint</button>
                        <button disabled={!isOwner(token, accountAddress)} className={classNames('transfer-tab__actions__btn', { 'transfer-tab__actions__btn--active': actionType === 'burn' })} onClick={() => this.handleMintOrBurn('burn')}>Burn</button>
                      </div>
                      <div className='transfer-tab__content__amount'>
                        <span className='transfer-tab__content__amount__text'>Amount</span>
                        <input className='transfer-tab__content__amount__field' type='number' placeholder='...' value={mintBurnAmount} onChange={(e) => this.onChange(e.target.value)} />
                      </div>
                      <div className='transfer-tab__content__button'>
                        {
                          actionType && <button onClick={this.handleMintOrBurnClick}>{upperCase(actionType)}</button>
                        }
                      </div>
                    </div>
                  </div>
                  {
                    isBurning || isMinting
                      ? (
                        <div className='bridge-deploying'>
                          <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                        </div>
                      ) : null
                  }
                  {
                    signatureNeeded
                      ? (
                        <div className='bridge-deploying'>
                          <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                          <div className='bridge-deploying-confirmation'>{`Waiting for signing`}</div>
                        </div>
                      ) : null
                  }
                </div>
              }
            </Tabs>
          </div>
          <Bridge
            accountAddress={accountAddress}
            token={this.props.token}
            foreignTokenAddress={this.props.tokenAddress}
            loadBridgePopup={this.loadBridgePopup}
            handleTransfer={this.handleTransfer}
            network={networkType}
          />
          <div className='dashboard-entities'>
            <EntityDirectory
              history={this.props.history}
              foreignTokenAddress={this.props.tokenAddress}
              token={this.props.token}
              loadBusinessListPopup={this.loadBusinessListPopup}
              onlyOnFuse={this.onlyOnFuse}
            />
          </div>
        </div>
        {
          this.props.token && accountAddress && this.props.dashboard.hasOwnProperty('userExists') &&
          <UserDataModal
            token={this.props.token}
            accountAddress={accountAddress}
            userExists={this.props.dashboard.userExists}
            loadUserDataModal={this.loadUserDataModal}
          />
        }
      </div>
    ]
  }
}

const mapStateToProps = (state, { match }) => ({
  ...state.screens.token,
  networkType: state.network.networkType,
  token: state.entities.tokens[match.params.address],
  tokenAddress: match.params.address,
  tokenNetworkType: match.params.networkType,
  metadata: state.entities.metadata,
  dashboard: state.screens.dashboard,
  accountAddress: getAccountAddress(state),
  clnBalance: getClnBalance(state),
  balances: getBalances(state),
  ...getTransaction(state, state.screens.token.transactionHash),
  homeTokenAddress: state.entities.bridges[match.params.address] && state.entities.bridges[match.params.address].homeTokenAddress
})

const mapDispatchToProps = {
  fetchTokenStatistics,
  fetchToken,
  isUserExists,
  loadModal,
  hideModal,
  deployBridge,
  createList,
  transferToken,
  mintToken,
  burnToken
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
