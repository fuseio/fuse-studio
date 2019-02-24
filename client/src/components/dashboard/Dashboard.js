import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ClnIcon from 'images/cln.png'
import { connect } from 'react-redux'
import {fetchToken, fetchTokenStatistics} from 'actions/token'
import {isUserExists} from 'actions/user'
import FontAwesome from 'react-fontawesome'
import {getClnBalance, getAccountAddress} from 'selectors/accounts'
import CommunityLogo from 'components/elements/CommunityLogo'
import {formatWei} from 'utils/format'
import { USER_DATA_MODAL } from 'constants/uiConstants'
import {loadModal, hideModal} from 'actions/ui'
import Header from './Header'
import ActivityContent from './ActivityContent'

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
    copyStatus: null
  }

  handleIntervalChange = (userType, intervalValue) => {
    this.props.fetchTokenStatistics(this.props.match.params.address, userType, intervalValue)
  }

  componentDidMount () {
    if (!this.props.token) {
      this.props.fetchToken(this.props.match.params.address)
    }
    if (this.props.accountAddress) {
      this.props.isUserExists(this.props.accountAddress)
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
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.content && !this.content.contains(event.target)) {
      this.setState({dropdownOpen: ''})
    }
  }

  showHomePage = (address) => {
    this.props.history.push('/')
  }

  copyToClipboard = (e) => {
    this.textArea.select()
    document.execCommand('copy')
    e.target.focus()
    this.setState({copyStatus: 'Copied!'})
    setTimeout(() => {
      this.setState({copyStatus: ''})
    }, 2000)
    this.textArea.value = ''
    this.textArea.value = this.props.match.params.address
  }

  loadUserDataModal = () => this.props.loadModal(USER_DATA_MODAL, {
    tokenAddress: this.props.match.params.address
  })

  render () {
    if (!this.props.token) {
      return null
    }

    const {token} = this.props
    const { admin, user } = this.props.dashboard

    return [
      <Header
        accountAddress={this.props.accountAddress}
        clnBalance={this.props.clnBalance}
        match={this.props.match}
        history={this.props.history}
        showHomePage={this.showHomePage}
        key={0}
      />,
      <div key={1} className='dashboard-content'>
        <div className='dashboard-header'>
          <button
            className='quit-button ctrl-btn'
            onClick={this.showHomePage}
          >
            <FontAwesome className='ctrl-icon' name='times' />
          </button>
        </div>
        <div className='dashboard-container'>
          <div className='dashboard-sidebar'>
            <CommunityLogo token={token} metadata={this.props.metadata[token.tokenURI] || {}} />
            <h3 className='dashboard-title'>{token.name}</h3>
          </div>
          <div className='dashboard-information'>
            <div className='dashboard-information-header'>
              <div className='dashboard-information-header-content'>
                <p className='dashboard-information-top'>
                  <span className='dashboard-information-logo'><img src={ClnIcon} /></span>
                  <span className='dashboard-information-text'>Total supply</span>
                </p>
                <p className='dashboard-information-big-count'>
                  {formatWei(token.totalSupply, 0)}
                  <span>{token.symbol}</span>
                </p>
              </div>
            </div>
            <div className='dashboard-info' ref={content => (this.content = content)}>
              <ActivityContent stats={user} userType='user' title='users' handleChange={this.handleIntervalChange} />
              <ActivityContent stats={admin} userType='admin' handleChange={this.handleIntervalChange} />
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
        {
          this.props.token && this.props.accountAddress && this.props.dashboard.hasOwnProperty('userExists') &&
            <UserDataModal token={this.props.token}
              accountAddress={this.props.accountAddress}
              userExists={this.props.dashboard.userExists}
              loadUserDataModal={this.loadUserDataModal} />
        }
      </div>
    ]
  }
}

const mapStateToProps = (state, {match}) => ({
  token: state.entities.tokens[match.params.address],
  metadata: state.entities.metadata,
  dashboard: state.screens.dashboard,
  accountAddress: getAccountAddress(state),
  clnBalance: getClnBalance(state)
})

const mapDispatchToProps = {
  fetchTokenStatistics,
  fetchToken,
  isUserExists,
  loadModal,
  hideModal
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
