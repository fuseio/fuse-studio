import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import web3 from 'web3'
import { fetchToken, fetchTokenStatistics, transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { isUserExists } from 'actions/user'
import { getClnBalance, getAccountAddress, getBalances } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { USER_DATA_MODAL, WRONG_NETWORK_MODAL, BRIDGE_MODAL, NO_DATA_ABOUT_OWNER_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import TokenProgress from './TokenProgress'
import TopNav from 'components/TopNav'
import Breadcrumbs from 'components/elements/Breadcrumbs'
import ActivityContent from './ActivityContent'
import Bridge from './Bridge'
import EntitiesManager from './EntitiesManager'
import { isOwner } from 'utils/token'
import Tabs from 'components/common/Tabs'
import Message from 'components/common/Message'
import { getTransaction } from 'selectors/transaction'
import { FAILURE, SUCCESS, PENDING } from 'actions/constants'
import TransferForm from './TransferForm'
import MintBurnForm from './MintBurnForm'

const LOAD_USER_DATA_MODAL_TIMEOUT = 2000

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
  state = {
    transferMessage: false,
    burnMessage: false,
    mintMessage: false,
    lastAction: {}
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
      this.props.loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [this.props.tokenNetworkType], handleClose: this.showHomePage })
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

    if (this.props.transactionStatus === SUCCESS && (!prevProps.transactionStatus || prevProps.transactionStatus === PENDING)) {
      this.setState({
        ...this.state
      })
    }

    if (this.props.transactionStatus === SUCCESS && (!prevProps.transactionStatus || prevProps.transactionStatus === PENDING)) {
      if (this.props.transferSuccess) {
        this.setState({ ...this.state, transferMessage: true })
      } else if (this.props.burnSuccess) {
        this.setState({ ...this.state, burnMessage: true })
      } else if (this.props.mintSuccess) {
        this.setState({ ...this.state, mintMessage: true })
      }
    }

    if (this.props.transactionStatus === FAILURE && (!prevProps.transactionStatus || prevProps.transactionStatus === PENDING)) {
      if (this.props.transferSuccess === false) {
        this.setState({ ...this.state, transferMessage: true })
      } else if (this.props.burnSuccess === false) {
        this.setState({ ...this.state, burnMessage: true })
      } else if (this.props.mintSuccess === false) {
        this.setState({ ...this.state, mintMessage: true })
      }
    }
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.content && !this.content.contains(event.target)) {
      this.setState({ dropdownOpen: '' })
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

  handleMintOrBurnClick = (actionType, amount) => {
    const { burnToken, mintToken, tokenAddress } = this.props
    if (actionType === 'mint') {
      mintToken(tokenAddress, web3.utils.toWei(String(amount)))
    } else {
      burnToken(tokenAddress, web3.utils.toWei(String(amount)))
    }

    this.setState({ ...this.state, lastAction: { actionType, mintBurnAmount: amount } })
  }

  handleTransper = ({ to: toField, amount }) => {
    const { transferToken, tokenAddress } = this.props
    transferToken(tokenAddress, toField, web3.utils.toWei(String(amount)))
  }

  render () {
    if (!this.props.token) {
      return null
    }
    const {
      lastAction,
      burnMessage,
      mintMessage,
      transferMessage
    } = this.state

    const {
      token,
      accountAddress,
      transactionStatus,
      balances,
      tokenAddress,
      dashboard,
      isTransfer,
      isMinting,
      isBurning,
      networkType,
      tokenNetworkType,
      burnSignature,
      mintSignature,
      transferSignature,
      metadata,
      history,
      match,
      clearTransactionStatus,
      error
    } = this.props

    const { tokenType } = token
    const balance = balances[tokenAddress]
    const { admin, user, steps } = dashboard
    return [
      <TopNav
        key={0}
        active
        history={history}
      />,
      <div key={1} className='dashboard-content'>
        <Breadcrumbs breadCrumbsText={token.name} setToHomepage={this.showHomePage} />
        <div className={`dashboard-container ${networkType}`}>
          <div className='dashboard-section'>
            <TokenProgress
              token={token}
              networkType={tokenNetworkType}
              metadata={metadata}
              steps={steps}
              tokenAddress={tokenAddress}
              tokenNetworkType={tokenNetworkType}
              match={match}
              loadBridgePopup={this.loadBridgePopup}
              loadUserDataModal={this.loadUserDataModal}
            />
            <Tabs>
              <div label='Stats'>
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
              <div label='Transfer' className={classNames({ 'tab__item--loader': isTransfer || transferSignature })}>
                <div className='transfer-tab'>
                  <div className='transfer-tab__balance'>
                    <span className='title'>Balance: </span>
                    <span className='amount'>{balance ? formatWei(balance, 0) : 0}</span>
                    <span className='symbol'>{token.symbol}</span>
                  </div>
                  <hr className='transfer-tab__line' />
                  <TransferForm
                    error={error}
                    balance={balance ? formatWei(balance, 0) : 0}
                    transactionStatus={transactionStatus}
                    transferMessage={transferMessage}
                    closeMessage={() => {
                      this.setState({ transferMessage: false })
                      clearTransactionStatus(null)
                    }}
                    handleTransper={this.handleTransper}
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
                      <span className='amount'>{balance ? formatWei(balance, 0) : 0}</span>
                      <span className='symbol'>{token.symbol}</span>
                    </div>
                    <hr className='transfer-tab__line' />
                    <MintBurnForm
                      error={error}
                      balance={balance ? formatWei(balance, 0) : 0}
                      handleMintOrBurnClick={this.handleMintOrBurnClick}
                      tokenNetworkType={tokenNetworkType}
                      token={token}
                      lastAction={lastAction}
                      accountAddress={accountAddress}
                      mintMessage={mintMessage}
                      burnMessage={burnMessage}
                      transactionStatus={transactionStatus}
                      closeMintMessage={() => {
                        this.setState({ mintMessage: false })
                        clearTransactionStatus(null)
                      }}
                      closeBurnMessage={() => {
                        this.setState({ burnMessage: false })
                        clearTransactionStatus(null)
                      }}
                    />
                  </div>
                  <Message message={'Pending'} isOpen={isBurning || isMinting} isDark subTitle='' />
                  <Message message={'Pending'} isOpen={mintSignature || burnSignature} isDark />
                </div>
              }
            </Tabs>
          </div>
          <Bridge
            bridgeDeployed={steps && steps.bridge}
            accountAddress={accountAddress}
            token={this.props.token}
            foreignTokenAddress={this.props.tokenAddress}
            loadBridgePopup={this.loadBridgePopup}
            handleTransfer={this.handleTransfer}
            network={networkType}
          />
          <EntitiesManager
            history={this.props.history}
            foreignTokenAddress={this.props.tokenAddress}
            token={this.props.token}
            onlyOnFuse={this.onlyOnFuse}
          />
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
  transferToken,
  mintToken,
  burnToken,
  clearTransactionStatus
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
