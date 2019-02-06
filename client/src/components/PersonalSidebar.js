import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import {fetchTokensWithBalances} from 'actions/accounts'
import {login} from 'actions/auth'
import ProfileIcon from 'images/user.svg'
import {BigNumber} from 'bignumber.js'
import FontAwesome from 'react-fontawesome'
import ReactGA from 'services/ga'
import {formatWei} from 'utils/format'
import {getAccount, getAccountTokens} from 'selectors/accounts'
import CommunityLogo from 'components/elements/CommunityLogo'

const MinimizedToken = ({accountAddress, token, metadata, balance}) => (
  <Fragment>
    <CommunityLogo token={token} metadata={metadata} />
    <div className='personal-community-content'>
      <div className='personal-community-content-balance'>
        CC Balance <span>{balance ? formatWei(balance, 0) : 0}</span>
        <p className='coin-name'>{token.name}</p>
      </div>
    </div>
  </Fragment>
)

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
    search ? tokens.filter(token =>
      token.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : tokens

  renderIssuedCoins (accountAddress, tokens) {
    return tokens.length ? tokens.map(token => {
      if ((token.owner === accountAddress)) {
        return (
          <div className='personal-community' key={token.address}>
            <MinimizedToken
              accountAddress={accountAddress}
              token={token}
              metadata={this.props.metadata[token.tokenURI] || {}}
              balance={this.props.account.balances[token.address]} />
            <button onClick={() => this.showDashboard(token.address)} className='btn-dashboard'>
              <FontAwesome name='signal' />
            </button>
          </div>
        )
      }
    }) : <p className='no-items'>There is no issued coins</p>
  }

  renderPortfolioCoins (accountAddress, tokens) {
    return tokens.length ? tokens.map(token => {
      return (
        <div className='personal-community' key={token.address}>
          <MinimizedToken
            accountAddress={accountAddress}
            token={token}
            metadata={this.props.metadata[token.tokenURI] || {}}
            balance={this.props.account.balances[token.address]} />
        </div>
      )
    }) : <p className='no-items'>There is no portfolio coins</p>
  }

  handleSearch = (event) => {
    this.setState({search: event.target.value})
  }

  render () {
    const { tokens } = this.props
    const filteredTokens = this.filterBySearch(this.state.search, tokens)

    return (
      <div className='personal-sidebar'>
        <div className='personal-sidebar-top'>
          <button className='personal-sidebar-close' onClick={() => this.props.closeProfile()}><FontAwesome name='times' /></button>
          <div className='profile-icon-big' onClick={() => this.props.login()}>
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
            {this.renderIssuedCoins(this.props.accountAddress, filteredTokens)}
          </div>
          <h3 className='personal-sidebar-title'>Portfolio Coins</h3>
          <div className='personal-sidebar-content-community'>
            {this.renderPortfolioCoins(this.props.accountAddress, filteredTokens)}
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
  tokens: getAccountTokens(state),
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  fetchTokensWithBalances,
  login
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalSidebar)
