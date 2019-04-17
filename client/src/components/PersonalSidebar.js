import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import {fetchTokensWithBalances} from 'actions/accounts'
import FontAwesome from 'react-fontawesome'
import {formatWei} from 'utils/format'
import {getAccount, getAccountTokens} from 'selectors/accounts'
import CommunityLogo from 'components/elements/CommunityLogo'
import ReactGA from 'services/ga'
import {getForeignNetwork} from 'selectors/network'

const MinimizedToken = ({networkType, accountAddress, token, metadata, balance}) => (
  <Fragment>
    <CommunityLogo networkType={networkType} isSmall token={token} metadata={metadata} />
    <div className='personal-community-content'>
      <div className='personal-community-content-balance'>
        <p className='coin-name'>{token.name}</p>
        Balance <span>{balance ? formatWei(balance, 0) : 0} {token && token.symbol ? token.symbol : ''}</span>
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

  showDashboard = (tokenAddress) => {
    const { foreignNetwork } = this.props
    this.props.history.push(`/view/dashboard/${foreignNetwork}/${tokenAddress}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
    this.props.closeProfile()
  }

  filterBySearch = (search, tokens) =>
    search ? tokens.filter(token =>
      token.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : tokens

  renderPortfolioCoins (accountAddress, tokens) {
    return tokens.length ? tokens.map(token => {
      return (
        <div className='personal-community' key={token.address} onClick={() => this.showDashboard(token.address)}>
          <MinimizedToken
            networkType={this.props.networkType}
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
        <div className='personal-sidebar-content'>
          <div className='personal-sidebar-search'>
            <input placeholder='What Currency are you looking for?' onChange={(e) => this.handleSearch(e)} />
            <button className='search-btn'><FontAwesome name='search' /></button>
          </div>
          <div className='personal-sidebar-content-community'>
            <h3 className='personal-sidebar-title'>Portfolio Coins</h3>
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
  networkType: state.network.networkType,
  account: getAccount(state),
  tokens: getAccountTokens(state),
  foreignNetwork: getForeignNetwork(state),
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  fetchTokensWithBalances
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalSidebar)
