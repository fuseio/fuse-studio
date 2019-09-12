import React, { Component, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import { toWei } from 'web3-utils'
import { balanceOfToken } from 'actions/accounts'
import * as actions from 'actions/bridge'
import { getBlockNumber } from 'actions/network'
import { getBalances } from 'selectors/accounts'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuseLogo.svg'
import arrow1 from 'images/arrow--1.svg'
import arrow2 from 'images/arrow--2.svg'
import { convertNetworkName } from 'utils/network'
import { getTransaction } from 'selectors/transaction'
import { loadModal } from 'actions/ui'
import { SHOW_MORE_MODAL } from 'constants/uiConstants'
import FuseLoader from 'images/loader-fuse.gif'
import { formatWei } from 'utils/format'

const NetworkLogo = ({ network }) => {
  switch (network) {
    case 'fuse':
      return <div className='network-logo'><img src={FuseLogo} /></div>
    default:
      return <div className='network-logo'><img src={MainnetLogo} /></div>
  }
}

const Balance = ({
  isAdmin,
  accountAddress,
  bridgeSide,
  disabled,
  transferStatus,
  tokenAddress,
  token,
  className,
  balances,
  openModal
}) => {
  const { symbol } = token
  const { bridge } = bridgeSide
  const balance = balances[tokenAddress]

  useEffect(() => {
    if (window && window.Appcues && isAdmin) {
      const { Appcues } = window
      if (bridge === 'home' && Number(new BigNumber(balance).div(1e18).toFixed()) > 0) {
        Appcues.identify(`${accountAddress}`, {
          role: 'admin',
          bridgeWasUsed: true
        })
      } else {
        Appcues.identify(`${accountAddress}`, {
          role: 'admin',
          bridgeWasUsed: false
        })
      }
    }
    return () => {}
  }, [bridge, balances])

  useEffect(() => {
    if (!transferStatus) {
      balanceOfToken(tokenAddress, accountAddress, { bridgeType: bridge })
    }
  }, [transferStatus])

  return (<div className={`bridge ${className}`}>
    <NetworkLogo network={bridgeSide.network} />
    <div className='bridge__title'>{convertNetworkName(bridgeSide.network)}</div>
    <div className='bridge__text'>
      <div>Balance</div>
      <span>{balance
        ? formatWei(balance, 2)
        : 0 } <small>{symbol}</small>
      </span>
    </div>
    <button className='bridge__more' disabled={disabled} onClick={openModal}>Show more</button>
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

  componentDidUpdate (prevProps) {
    if (this.props.waitingForConfirmation && !prevProps.waitingForConfirmation) {
      if (this.props.bridgeStatus.to.bridge === 'home') {
        this.props.watchHomeBridge(this.props.homeBridgeAddress, this.props.transactionHash)
      } else {
        this.props.watchForeignBridge(this.props.foreignBridgeAddress, this.props.transactionHash)
      }
    }

    if (!this.props.transferStatus && prevProps.transferStatus) {
      this.setState({ transferAmount: 0 })
    }
  }

  setTransferAmount = (e) => this.setState({ transferAmount: e.target.value })

  handleTransfer = () => {
    const value = toWei(this.state.transferAmount)
    if (this.props.bridgeStatus.to.bridge === 'home') {
      this.props.transferToHome(this.props.foreignTokenAddress, this.props.foreignBridgeAddress, value)
    } else {
      this.props.transferToForeign(this.props.homeTokenAddress, this.props.homeBridgeAddress, value)
    }
    this.props.getBlockNumber(this.props.bridgeStatus.to.network, this.props.bridgeStatus.to.bridge)
    this.props.getBlockNumber(this.props.bridgeStatus.from.network, this.props.bridgeStatus.from.bridge)
  }

  openModal = (side) => {
    const {
      loadModal,
      foreignTokenAddress,
      homeTokenAddress,
      homeBridgeAddress,
      foreignBridgeAddress,
      bridgeStatus,
      token,
      balances,
      homeNetwork
    } = this.props
    loadModal(SHOW_MORE_MODAL, {
      name: convertNetworkName(bridgeStatus[side].network),
      network: bridgeStatus[side].network !== 'fuse' ? `https://api.infura.io/v1/jsonrpc/${bridgeStatus[side].network}` : 'https://rpc.fusenet.io',
      homeTokenAddress,
      foreignTokenAddress,
      homeBridgeAddress,
      foreignBridgeAddress,
      tokenName: token.name,
      tokenAmount: balances[homeNetwork === bridgeStatus[side].network ? homeTokenAddress : foreignTokenAddress]
        ? formatWei(balances[homeNetwork === bridgeStatus[side].network ? homeTokenAddress : foreignTokenAddress])
        : 0
    })
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
      confirmationsLimit,
      bridgeDeployed,
      isOwner,
      tokenOfCommunityOnCurrentSide,
      isAdmin
    } = this.props

    const {
      transferAmount
    } = this.state

    const balance = balances[tokenOfCommunityOnCurrentSide]
    const formatted = formatWei(balance, 2)

    return (
      <div className='content__bridge__wrapper'>
        <div className='content__bridge__container'>
          <Balance
            isAdmin={isAdmin}
            balanceOfToken={balanceOfToken}
            tokenAddress={homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress}
            accountAddress={accountAddress}
            token={token}
            balances={balances}
            bridgeSide={bridgeStatus.from}
            transferStatus={transferStatus}
            className={`balance-${network}`}
            openModal={() => this.openModal('from')}
          />
          <div className='bridge__arrow'>
            <img src={homeNetwork === bridgeStatus.from.network ? arrow1 : arrow2} />
          </div>
          <div className='bridge__transfer'>
            {
              (bridgeDeployed)
                ? (
                  <React.Fragment>
                    <div className='bridge__transfer__form'>
                      <input type='number' value={transferAmount} max={formatted} placeholder='0' onChange={this.setTransferAmount} disabled={transferStatus} />
                      <div className='bridge__transfer__form__currency'>{this.props.token.symbol}</div>
                    </div>
                    <button disabled={transferStatus || !Number(transferAmount) || !accountAddress || BigNumber(transferAmount).multipliedBy(1e18).isGreaterThan(new BigNumber(balance))}
                      className='bridge__transfer__form__btn' onClick={this.handleTransfer}>
                      {transferStatus || `Transfer to ${bridgeStatus.to.network}`}
                    </button>
                  </React.Fragment>
                ) : (
                  <div>
                    <div className='bridge__transfer__title'>Some Headline About the Bridge</div>
                    <div className='bridge__transfer__text'>Explanation about deploying it</div>
                    <button className='bridge__transfer__deploy-btn'
                      disabled={!isOwner() || this.props.bridgeDeploying}
                      onClick={this.props.loadBridgePopup}>
                      Deploy Bridge
                    </button>
                  </div>
                )
            }
          </div>
          <div className='bridge__arrow'>
            <img src={homeNetwork === bridgeStatus.to.network ? arrow1 : arrow2} />
          </div>
          <Balance
            isAdmin={isAdmin}
            balanceOfToken={balanceOfToken}
            tokenAddress={homeNetwork === bridgeStatus.to.network ? homeTokenAddress : foreignTokenAddress}
            accountAddress={accountAddress}
            token={token}
            balances={balances}
            bridgeSide={bridgeStatus.to}
            transferStatus={transferStatus}
            disabled={!foreignTokenAddress || !homeTokenAddress}
            className={foreignTokenAddress && homeTokenAddress ? `balance-${network}` : 'balance-disabled'}
            openModal={() => this.openModal('to')}
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
                <p className='bridge-deploying__loader'><img src={FuseLoader} alt='Fuse loader' /></p>
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

const mapStateToProps = (state, { foreignTokenAddress }) => ({
  ...state.screens.bridge,
  ...state.entities.bridges[foreignTokenAddress],
  homeNetwork: state.network.homeNetwork,
  balances: getBalances(state),
  ...getTransaction(state, state.screens.bridge.transactionHash)
})

const mapDispatchToProps = {
  ...actions,
  balanceOfToken,
  getBlockNumber,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(BridgeContainer)
