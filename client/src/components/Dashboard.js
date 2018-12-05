import React, { Component } from 'react'
import ClnIcon from 'images/cln.png'
import Calculator from 'images/calculator-Icon.svg'
import { connect } from 'react-redux'
import {fetchCommunityWithAdditionalData, fetchDashboardStatistics} from 'actions/communities'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import CommunityLogo from 'components/elements/CommunityLogo'
import {formatEther, formatWei} from 'utils/format'
import {loadModal} from 'actions/ui'
import {SIMPLE_EXCHANGE_MODAL} from 'constants/uiConstants'

class Dashboard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      dropdownOpen: '',
      dropdown: {}
    }

    this.handleClickOutside = this.handleClickOutside.bind(this)
  }
  componentDidMount () {
    this.props.fetchCommunityWithAdditionalData(this.props.match.params.address)
    this.props.fetchDashboardStatistics(this.props.match.params.address)
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  handleAddCln = (token, marketMaker) => {
    this.props.loadModal(SIMPLE_EXCHANGE_MODAL, {tokenAddress: this.props.match.params.address})
  }

  handleClickOutside (event) {
    if (this.content && !this.content.contains(event.target)) {
      this.setState({dropdownOpen: ''})
    }
  }

  setOpenDropdown (type) {
    if (type !== this.state.dropdownOpen) {
      this.setState({dropdownOpen: type})
    } else {
      this.setState({dropdownOpen: ''})
    }
  }

  setActivePointDropdown (type, text) {
    this.setState(prevState => ({
      dropdown: {
        ...prevState.dropdown,
        [type]: {text: text}
      }
    }))
    this.setState({dropdownOpen: ''})
  }

  activityDropdown (type) {
    const dropdownContent = ['Monthly', 'Weekly', 'Daily']
    return (
      <div className='dashboard-information-period' ref={type => (this.type = type)}>
        <span className='dashboard-information-period-text' onClick={() => this.setOpenDropdown(type)}>
          {this.state.dropdown && this.state.dropdown[type] && this.state.dropdown[type].text
            ? this.state.dropdown[type].text : dropdownContent[0]} <FontAwesome name='caret-down' />
        </span>
        {(type === this.state.dropdownOpen) &&
          <div className='dashboard-information-period-additional'>
            {dropdownContent.map((item, index) =>
              <div
                className={classNames(
                  'dashboard-information-period-point',
                  this.state.dropdown[type] && this.state.dropdown[type].text && this.state.dropdown[type].text === item ? 'active-point' : null
                )}
                key={index}
                onClick={() => this.setActivePointDropdown(type, item)}
              >
                {item}
              </div>
            )}
          </div>
        }
      </div>
    )
  }

  renderActivityContent = (type, data) => [
    <div className='dashboard-information-content-activity' key='0'>
      <p className='dashboard-information-small-text'>
        <span>{type}</span> Activity
      </p>
      {this.activityDropdown(type)}
    </div>,
    <div className='dashboard-information-content-number' key='1'>
      <p className='dashboard-information-small-text'>
        Number of transactions
      </p>
      <p className='dashboard-information-number'>
        {data && data.length ? data[0].totalCount : '0'}
      </p>
    </div>,
    <div className='dashboard-information-content-number' key='2'>
      <p className='dashboard-information-small-text'>
        Transactions volume
      </p>
      <p className='dashboard-information-number'>
        {data && data.length ? formatWei(data[0].volume, 0) : '0'}
      </p>
    </div>
  ]

  copyToClipboard = (e) => {
    this.textArea.select()
    document.execCommand('copy')
    e.target.focus()
    this.setState({copyStatus: 'Copied!'})
    setTimeout(() => {
      this.setState({copyStatus: ''})
    }, 2000)
  };

  render () {
    const token = {...this.props.tokens[this.props.match.params.address], address: this.props.match.params.address}
    const marketMaker = {
      isOpenForPublic: this.props.marketMaker && this.props.marketMaker[this.props.match.params.address] && this.props.marketMaker[this.props.match.params.address].isOpenForPublic ? this.props.marketMaker[this.props.match.params.address].isOpenForPublic : false,
      currentPrice: this.props.marketMaker && this.props.marketMaker[this.props.match.params.address] && this.props.marketMaker[this.props.match.params.address].currentPrice ? this.props.marketMaker[this.props.match.params.address].currentPrice : new BigNumber(0),
      clnReserve: this.props.marketMaker && this.props.marketMaker[this.props.match.params.address] && this.props.marketMaker[this.props.match.params.address].clnReserve ? this.props.marketMaker[this.props.match.params.address].clnReserve : new BigNumber(0)
    }
    const coinStatusClassStyle = classNames({
      'coin-status': true,
      'coin-status-active': marketMaker.isOpenForPublic,
      'coin-status-close': !marketMaker.isOpenForPublic
    })
    const { admin, user } = this.props.dashboard
    return (
      <div className='dashboard-content'>
        <div className='dashboard-header'>
          <div className='dashboard-logo'>
            <a href='https://cln.network/' target='_blank'><img src={ClnIcon} /></a>
          </div>
        </div>
        <div className='dashboard-container'>
          <div className='dashboard-sidebar'>
            <CommunityLogo token={token} />
            {this.props.dashboard.community && this.props.dashboard.community.name
              ? <h3 className='dashboard-title'>{this.props.dashboard.community.name}</h3>
              : null}
            <div className={coinStatusClassStyle}>
              <span className='coin-status-indicator' />
              <span className='coin-status-text' onClick={this.openMarket}>
                {marketMaker.isOpenForPublic ? 'open' : 'closed'}
              </span>
            </div>
            <button onClick={() => this.handleAddCln(token, marketMaker)} className='btn-adding big-adding-btn'>
              <FontAwesome name='plus' className='top-nav-issuance-plus' /> Add CLN
            </button>
            <div className='coin-content'>
              <div className='coin-content-type'>
                <span className='coin-currency-type'>CLN</span>
                <span className='coin-currency'>{formatEther(marketMaker.currentPrice)}</span>
              </div>
              <div className='coin-content-type'>
                <span className='coin-currency-type'>USD</span>
                <span className='coin-currency'>{formatEther(marketMaker.currentPrice.multipliedBy(this.props.fiat.USD && this.props.fiat.USD.price))}</span>
              </div>
            </div>
          </div>
          <div className='dashboard-information'>
            <div className='dashboard-information-header'>
              <div>
                <p className='dashboard-information-top'>
                  <span className='dashboard-information-logo'><img src={ClnIcon} /></span>
                  <span className='dashboard-information-text'>Total supply</span>
                </p>
                <p className='dashboard-information-big-count'>
                  {formatWei(token.totalSupply, 0)}
                  <span>{token.symbol}</span>
                </p>
              </div>
              <div>
                <p className='dashboard-information-top'>
                  <span className='dashboard-information-logo logo-inverse'><img src={Calculator} /></span>
                  <span className='dashboard-information-text'>Circulation</span>
                </p>
                <p className='dashboard-information-big-count'>
                  315,00
                  <span>{token.symbol}</span>
                </p>
              </div>
            </div>
            <div className='dashboard-info' ref={content => (this.content = content)}>
              <div className='dashboard-information-content' >
                {this.renderActivityContent('user', user)}
              </div>
              <div className='dashboard-information-content'>
                {this.renderActivityContent('admin', admin)}
              </div>
            </div>
            <div className='dashboard-information-footer'>
              <div className='dashboard-information-small-text'>
                <span>Asset ID</span>
                <form>
                  <textarea
                    ref={textarea => (this.textArea = textarea)}
                    value={this.props.match.params.address}
                    readOnly
                  />
                </form>
              </div>
              {document.queryCommandSupported('copy') &&
                <p className='dashboard-information-period' onClick={this.copyToClipboard}>
                  copy
                </p>
              }
            </div>
            {this.state.copyStatus && <div className='dashboard-notification'>
              {this.state.copyStatus}
            </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  tokens: state.tokens,
  fiat: state.fiat,
  marketMaker: state.marketMaker,
  dashboard: state.screens.dashboard
})

const mapDispatchToProps = {
  fetchDashboardStatistics,
  fetchCommunityWithAdditionalData,
  loadModal
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
