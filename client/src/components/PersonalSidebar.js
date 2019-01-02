import React, {Component} from 'react'
import pickBy from 'lodash/pickBy'
import {connect} from 'react-redux'
import {fetchTokens, fetchBalances, fetchTokensWithBalances} from 'actions/accounts'
import ProfileIcon from 'images/user.svg'
import {BigNumber} from 'bignumber.js'
import FontAwesome from 'react-fontawesome'
import ReactGA from 'services/ga'
import {formatEther, formatWei} from 'utils/format'
import {getAccount} from 'selectors/accounts'
import CommunityLogo from 'components/elements/CommunityLogo'

const PersonalSidebarCoin = ({accountAddress, token, marketMaker, balance, fiat}) => [
  <CommunityLogo token={token} />,
  <div className='personal-community-content'>
    <div className='personal-community-content-balance'>
      CC Balance <span>{balance ? formatWei(balance, 0) : 0}</span>
      <p className='coin-name'>{token.name}</p>
      <div className='coin-content'>
        <div className='coin-content-type'>
          <span className='coin-currency-type'>CLN</span>
          <span className='coin-currency'>{marketMaker ? formatEther(marketMaker.currentPrice) : null}</span>
        </div>
        <div className='coin-content-type'>
          <span className='coin-currency-type'>USD</span>
          <span className='coin-currency'>
            {
              marketMaker
                ? formatEther(marketMaker.currentPrice.multipliedBy(fiat.USD && fiat.USD.price))
                : null
            }</span>
        </div>
      </div>
    </div>
  </div>
]

class PersonalSidebar extends Component {
  state = {
    search: ''
  }
  componentWillReceiveProps = ({accountAddress, account}) => {
    if (accountAddress && !this.props.accountAddress) {
      this.props.fetchTokensWithBalances(accountAddress)
    }
  }

  componentDidMount () {
    if (this.props.accountAddress) {
      this.props.fetchTokensWithBalances(this.props.accountAddress)
    }
  }

  showDashboard = (address) => {
    this.props.history.push(`/view/dashboard/${address}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
  }

  filterBySearch = (search, tokens) =>
    search ? pickBy(tokens, (token) =>
      token.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : tokens

  renderIssuedCoins (accountAddress, tokens, marketMaker) {
    return tokens && Object.keys(tokens).length ? Object.keys(tokens).map((key) => {
      if ((tokens[key].owner === accountAddress)) {
        return (
          <div className='personal-community'>
            <PersonalSidebarCoin
              fiat={this.props.fiat}
              accountAddress={accountAddress}
              token={tokens[key]}
              marketMaker={marketMaker[key]}
              balance={this.props.account.balances[key]} />
            <button onClick={() => this.showDashboard(tokens[key].address)} className='btn-dashboard'>
              <FontAwesome name='signal' />
            </button>
          </div>
        )
      }
    }) : <p className='no-items'>There is no issued coins</p>
  }

  renderPortfolioCoins (accountAddress, tokens, marketMaker) {
    return tokens && Object.keys(tokens).length ? Object.keys(tokens).map((key) => {
      if (marketMaker[key]) {
        return (
          <div className='personal-community'>
            <PersonalSidebarCoin
              fiat={this.props.fiat}
              accountAddress={accountAddress}
              token={tokens[key]}
              marketMaker={marketMaker[key]}
              balance={this.props.account.balances[key]} />
          </div>
        )
      }
    }) : <p className='no-items'>There is no portfolio coins</p>
  }

  handleSearch = (event) => {
    this.setState({search: event.target.value})
  }

  render () {
    const { tokens, marketMaker } = this.props
    const filteredTokens = this.filterBySearch(this.state.search, tokens)

    return (
      <div className='personal-sidebar'>
        <div className='personal-sidebar-top'>
          <button className='personal-sidebar-close' onClick={() => this.props.closeProfile()}><FontAwesome name='times' /></button>
          <div className='profile-icon-big' onClick={() => this.setState({profile: !this.state.profile})}>
            <img src={ProfileIcon} />
          </div>
          <span className='profile-balance'>
            <span className='balance-address'>{this.props.accountAddress || 'Connect Metamask'}</span>
            {(this.props.clnBalance)
              ? <div className='nav-balance'>
                <span className='balance-text'>Balance:</span>
                <span className='balance-number'>{new BigNumber(this.props.clnBalance).div(1e18).toFormat(2, 1)}</span>
              </div>
              : null}
          </span>
        </div>
        <div className='personal-sidebar-search'>
          <input placeholder='What Currency are you looking for?' onChange={(e) => this.handleSearch(e)} />
          <button className='search-btn'><FontAwesome name='search' /></button>
        </div>
        <div className='personal-sidebar-content'>
          <h3 className='personal-sidebar-title'>Issued Coins</h3>
          <div className='personal-sidebar-content-community'>
            {this.renderIssuedCoins(this.props.accountAddress, filteredTokens, marketMaker)}
          </div>
          <h3 className='personal-sidebar-title'>Portfolio Coins</h3>
          <div className='personal-sidebar-content-community'>
            {this.renderPortfolioCoins(this.props.accountAddress, filteredTokens, marketMaker)}
          </div>
        </div>
        <div className='personal-sidebar-shadow' onClick={() => this.props.closeProfile()} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  account: getAccount(state),
  tokens: state.tokens,
  marketMaker: state.marketMaker,
  fiat: state.fiat
})

const mapDispatchToProps = {
  fetchTokens,
  fetchBalances,
  fetchTokensWithBalances
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalSidebar)
