import React, { Component, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {BigNumber} from 'bignumber.js'
import web3 from 'web3'
import FontAwesome from 'react-fontawesome'
import {balanceOfToken} from 'actions/accounts'
import * as actions from 'actions/bridge'
import {getBlockNumber} from 'actions/network'
import {getBalances} from 'selectors/accounts'
import {getBridgeStatus} from 'selectors/network'
import RopstenLogo from 'images/Ropsten.png'
import MainnetLogo from 'images/Mainnet.png'
import FuseLogo from 'images/fuseLogo.svg'
import {convertNetworkName} from 'utils/network'
import {getTransaction} from 'selectors/transaction'

const NetworkLogo = ({network}) => {
  switch (network) {
    case 'fuse':
      return <div className='dashboard-network-logo fuse-logo'><img src={FuseLogo} /></div>
    case 'ropsten':
      return <div className='dashboard-network-logo'><img src={RopstenLogo} /></div>
    case 'main':
      return <div className='dashboard-network-logo ethereum-logo'><img src={MainnetLogo} /></div>
  }
}

const Balance = (props) => {
  useEffect(() => {
    if (props.tokenAddress && props.accountAddress && !props.transferStatus) {
      props.balanceOfToken(props.tokenAddress, props.accountAddress, {bridgeType: props.bridgeSide.bridge})
    }
  }, [props.tokenAddress, props.accountAddress, props.transferStatus])
  return (<div className={`dashboard-network-content ${props.className}`}>
    <NetworkLogo network={props.bridgeSide.network} />
    <div className='dashboard-network-title'>{convertNetworkName(props.bridgeSide.network)}</div>
    <div className='dashboard-network-text'>
      <div>Balance</div>
      <span>{props.balances[props.tokenAddress]
        ? new BigNumber(props.balances[props.tokenAddress]).div(1e18).toFormat(2, 1)
        : 0 } {props.token.symbol}
      </span>
    </div>
    <button className='dashboard-network-btn' disabled={props.disabled}>Show more</button>
  </div>)
}

Balance.propTypes = {
  balanceOfToken: PropTypes.func.isRequired,
  accountAddress: PropTypes.string,
  tokenAddress: PropTypes.string,
  token: PropTypes.object,
  bridgeSide: PropTypes.object.isRequired
}

class Bridge extends Component {
  state = {
    transferAmount: ''
  }

  componentDidMount () {
    this.props.fetchHomeToken(this.props.foreignTokenAddress)
    this.props.fetchHomeBridge(this.props.foreignTokenAddress)
    this.props.fetchForeignBridge(this.props.foreignTokenAddress)
  }

  componentDidUpdate (prevProps) {
    if (this.props.waitingForConfirmation && !prevProps.waitingForConfirmation) {
      if (this.props.bridgeStatus.to.bridge === 'home') {
        this.props.watchHomeBridge(this.props.homeBridgeAddress, this.props.transactionHash)
      } else {
        this.props.watchForeignBridge(this.props.foreignBridgeAddress, this.props.transactionHash)
      }
    }

    if (!this.props.transferStatus && prevProps.transferStatus) {
      this.setState({transferAmount: 0})
    }
  }

  isOwner = () => this.props.accountAddress === this.props.token.owner

  setTransferAmount = (e) => this.setState({ transferAmount: e.target.value })

  handleTransfer = () => {
    const value = web3.utils.toWei(this.state.transferAmount)
    if (this.props.bridgeStatus.to.bridge === 'home') {
      this.props.transferToHome(this.props.foreignTokenAddress, this.props.foreignBridgeAddress, value)
    } else {
      this.props.transferToForeign(this.props.homeTokenAddress, this.props.homeBridgeAddress, value)
    }
    this.props.getBlockNumber(this.props.bridgeStatus.to.network, this.props.bridgeStatus.to.bridge)
    this.props.getBlockNumber(this.props.bridgeStatus.from.network, this.props.bridgeStatus.from.bridge)
  }

  render () {
    const {
      balances,
      balanceOfToken,
      homeNetwork,
      bridgeStatus,
      accountAddress,
      token,
      homeTokenAddress,
      foreignTokenAddress,
      transferStatus,
      bridgeDeploying,
      network,
      waitingForConfirmation,
      confirmationNumber,
      confirmationsLimit
    } = this.props

    const {
      transferAmount
    } = this.state

    const balance = balances[homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress]
    const formatted = new BigNumber(balance).div(1e18).toFormat(2, 1)

    return (
      <div className='dashboard-bridge'>
        <div className='dashboard-network'>
          <Balance
            balanceOfToken={balanceOfToken}
            tokenAddress={homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress}
            accountAddress={accountAddress}
            token={token}
            balances={balances}
            bridgeSide={bridgeStatus.from}
            transferStatus={transferStatus}
            className={`balance-${network}`}
          />
          <div className='dashboard-network-content network-arrow'>
            <FontAwesome name='long-arrow-alt-right' />
          </div>
          <div className='dashboard-transfer'>
            {
              (foreignTokenAddress && homeTokenAddress)
                ? (
                  <div>
                    <div className='dashboard-transfer-form'>
                      <input type='number' value={transferAmount} max={formatted} placeholder='0' onChange={this.setTransferAmount} disabled={transferStatus} />
                      <div className='dashboard-transfer-form-currency'>{this.props.token.symbol}</div>
                    </div>
                    <button disabled={transferStatus || !Number(transferAmount) || !accountAddress || new BigNumber(transferAmount).toFormat(2, 1) > formatted}
                      className='dashboard-transfer-btn' onClick={this.handleTransfer}>
                      {transferStatus || `Transfer to ${bridgeStatus.to.network}`}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className='dashboard-transfer-title'>Some Headline About the Bridge</div>
                    <div className='dashboard-transfer-text'>Explanation about deploying it</div>
                    <button className='dashboard-transfer-btn dashboard-transfer-deploy-btn'
                      disabled={!this.isOwner() || this.props.bridgeDeploying}
                      onClick={this.props.loadBridgePopup}>
                      Deploy Bridge
                    </button>
                  </div>
                )
            }
          </div>
          <div className='dashboard-network-content network-arrow'>
            <FontAwesome name='long-arrow-alt-right' />
          </div>
          <Balance
            balanceOfToken={balanceOfToken}
            tokenAddress={homeNetwork === bridgeStatus.to.network ? homeTokenAddress : foreignTokenAddress}
            accountAddress={accountAddress}
            token={token}
            balances={balances}
            bridgeSide={bridgeStatus.to}
            transferStatus={transferStatus}
            disabled={!foreignTokenAddress || !homeTokenAddress}
            className={foreignTokenAddress && homeTokenAddress ? `balance-${network}` : 'balance-disabled'}
          />
        </div>
        {
          bridgeDeploying
            ? (
              <div className='bridge-deploying'>
                <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
              </div>
            ) : null
        }
        {
          waitingForConfirmation
            ? (
              <div className='bridge-deploying'>
                <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                <div className='bridge-deploying-confirmation'>
                  Confirmations
                  <div>{confirmationNumber || '0'} / {confirmationsLimit}</div>
                </div>
              </div>
            ) : null
        }
      </div>
    )
  }
}

Bridge.propTypes = {
  accountAddress: PropTypes.string,
  homeTokenAddress: PropTypes.string,
  foreignTokenAddress: PropTypes.string,
  networkType: PropTypes.string
}

class BridgeContainer extends Component {
  isConfirmed = () => this.props.confirmationsLimit <= this.props.confirmationNumber
  isSent = () => this.props.transactionStatus === 'PENDING' || this.props.transactionStatus === 'SUCCESS'

  isWaitingForConfirmation = () => this.isSent() && !this.isConfirmed()

  getTransferStatus = () => {
    if (this.props.transactionStatus === 'PENDING') {
      return 'PENDING'
    }

    if (this.props.transactionStatus === 'SUCCESS') {
      if (!this.isConfirmed()) {
        return 'WAITING FOR CONFIRMATION'
      }
      if (!this.props.relayEvent) {
        return 'WAITING FOR BRIDGE'
      }
    }
  }

  render = () => {
    if (this.props.foreignTokenAddress) {
      return <Bridge
        {...this.props} waitingForConfirmation={this.isWaitingForConfirmation()}
        transferStatus={this.getTransferStatus()} />
    } else {
      return null
    }
  }
}

const mapStateToProps = (state, {foreignTokenAddress}) => ({
  ...state.screens.bridge,
  ...state.entities.bridges[foreignTokenAddress],
  homeNetwork: state.network.homeNetwork,
  bridgeStatus: getBridgeStatus(state),
  balances: getBalances(state),
  ...getTransaction(state, state.screens.bridge.transactionHash)
})

const mapDispatchToProps = {
  ...actions,
  balanceOfToken,
  getBlockNumber
}

export default connect(mapStateToProps, mapDispatchToProps)(BridgeContainer)
