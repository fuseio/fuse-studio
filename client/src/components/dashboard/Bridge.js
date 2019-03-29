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

const NetworkLogo = ({network}) => {
  switch (network) {
    case 'fuse':
      return <div className='dashboard-network-logo fuse-logo'><img src={FuseLogo} /></div>
    case 'ropsten':
      return <div className='dashboard-network-logo'><img src={RopstenLogo} /></div>
    case 'main':
      return <div className='dashboard-network-logo'><img src={MainnetLogo} /></div>
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
    <div className='dashboard-network-title'>{props.bridgeSide.network}</div>
    <div className='dashboard-network-text'>
      Balance
      <span>{props.balances[props.tokenAddress]
        ? new BigNumber(props.balances[props.tokenAddress]).div(1e18).toFormat(2, 1)
        : 0 } {props.token.symbol}
      </span>
    </div>
    <button className='dashboard-network-btn'>Show more</button>
  </div>)
}

Balance.propTypes = {
  balanceOfToken: PropTypes.func.isRequired,
  accountAddress: PropTypes.string.isRequired,
  tokenAddress: PropTypes.string,
  token: PropTypes.object,
  bridgeSide: PropTypes.object.isRequired
}

class Bridge extends Component {
  state = {
    transferAmount: 0
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

  render = () => (
    <div className='dashboard-bridge'>
      <div className='dashboard-network'>
        <Balance
          balanceOfToken={this.props.balanceOfToken}
          tokenAddress={this.props.homeNetwork === this.props.bridgeStatus.from.network ? this.props.homeTokenAddress : this.props.foreignTokenAddress}
          accountAddress={this.props.accountAddress}
          token={this.props.token}
          balances={this.props.balances}
          bridgeSide={this.props.bridgeStatus.from}
          transferStatus={this.props.transferStatus}
          className={`balance-${this.props.network}`}
        />
        <div className='dashboard-network-content network-arrow'>
          <FontAwesome name='long-arrow-alt-right' />
        </div>
        <div className='dashboard-transfer'>
          {(this.props.foreignTokenAddress && this.props.homeTokenAddress)
            ? <div>
              <div className='dashboard-transfer-form'>
                <input type='number' value={this.state.transferAmount} onChange={this.setTransferAmount} disabled={this.props.transferStatus} />
                <div className='dashboard-transfer-form-currency'>{this.props.token.symbol}</div>
              </div>
              <button disabled={this.props.transferStatus || !Number(this.state.transferAmount) || !this.props.accountAddress}
                className='dashboard-transfer-btn' onClick={this.handleTransfer}>
                {this.props.transferStatus || `Transfer to ${this.props.bridgeStatus.to.network}`}
              </button>
              {
                this.props.waitingForConfirmation
                  ? <div>Confirmations: {this.props.confirmationNumber} / {this.props.confirmationsLimit} </div>
                  : null
              }
            </div>
            : (
              <div>
                <div className='dashboard-transfer-title'>Some Headline About the Bridge</div>
                <div className='dashboard-transfer-text'>Explanation about deploying it</div>
                <button className='dashboard-transfer-btn dashboard-transfer-deploy-btn'
                  disabled={!this.isOwner() || this.props.bridgeDeploying}
                  onClick={this.props.loadBridgePopup}>
                  {this.props.bridgeDeploying ? 'Pending' : 'Deploy Bridge'}
                </button>
              </div>
            )
          }
        </div>
        <div className='dashboard-network-content network-arrow'>
          <FontAwesome name='long-arrow-alt-right' />
        </div>
        <Balance
          balanceOfToken={this.props.balanceOfToken}
          tokenAddress={this.props.homeNetwork === this.props.bridgeStatus.to.network ? this.props.homeTokenAddress : this.props.foreignTokenAddress}
          accountAddress={this.props.accountAddress}
          token={this.props.token}
          balances={this.props.balances}
          bridgeSide={this.props.bridgeStatus.to}
          transferStatus={this.props.transferStatus}
          className={this.props.foreignTokenAddress && this.props.homeTokenAddress ? `balance-${this.props.network}` : 'balance-disabled'}
        />
      </div>
    </div>
  )
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

const mapStateToProps = (state) => ({
  ...state.screens.bridge,
  homeNetwork: state.network.homeNetwork,
  bridgeStatus: getBridgeStatus(state),
  balances: getBalances(state)
})

const mapDispatchToProps = {
  ...actions,
  balanceOfToken,
  getBlockNumber
}

export default connect(mapStateToProps, mapDispatchToProps)(BridgeContainer)
