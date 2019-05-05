import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CommunityLogo from 'components/elements/CommunityLogo'
import {fetchTokenProgress} from 'actions/token'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'
import CopyToClipboard from 'components/common/CopyToClipboard'
import {formatWei} from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'

const Step = ({done, text, handleClick}) => (
  <div
    className={classNames('dashboard-progress-text', {
      'text-positive': done,
      'text-negative': !done
    })}
    onClick={done ? null : handleClick}
  >
    <FontAwesome name={classNames({'check': done, 'minus': !done})} /> <span className='progress-text-content'>{text}</span>
  </div>
)

class TokenProgress extends Component {
  componentDidMount () {
    this.props.fetchTokenProgress(this.props.match.params.address)
  }

  render () {
    const { token, networkType } = this.props
    const steps = this.props.steps
    const doneSteps = Object.values(steps).filter(step => step)
    const progressOverall = doneSteps.length * 20
    return (
      <div className='dashboard-sidebar'>
        <div className='logo'><CommunityLogo networkType={networkType} token={token} metadata={this.props.metadata[token.tokenURI] || {}} /></div>
        <div className='token-info'>
          <h5 className='token-info__title'>{token.name}</h5>
          <div className='token-info__total'><span>Total supply: {formatWei(token.totalSupply, 0)}</span><span>{token.symbol}</span></div>
          <div className='asset-id'>
            <span className='text'>Asset ID</span>
            <a href={`${getBlockExplorerUrl(this.props.tokenNetworkType)}/address/${this.props.tokenAddress}`}
              target='_blank'>
              <span className='id'>{this.props.tokenAddress.substring(0, 6)}...{this.props.tokenAddress.substr(this.props.tokenAddress.length - 4)}</span>
            </a>
            <CopyToClipboard text={this.props.tokenAddress}>
              <p className='dashboard-information-period'>
                <FontAwesome name='clone' />
              </p>
            </CopyToClipboard>
          </div>
          <hr className='line' />
        </div>
        <div className='dashboard-progress'>
          <div className={`dashboard-progress-bar-${progressOverall}`} />
          <div className='dashboard-progress-content'>
            <div className='dashboard-progress-title'>Overall progress</div>
            <div className='dashboard-progress-percent'>{progressOverall}%</div>
          </div>
        </div>
        <Step done={steps.tokenIssued}
          text='Community token deployed' />
        <Step done={steps.detailsGiven} handleClick={this.props.loadUserDataModal}
          text='Admin personal name given' />
        <Step done={steps.bridge} handleClick={this.props.loadBridgePopup}
          text='Bridge to Fuse - chain deployed' />
        <Step done={steps.membersList} handleClick={this.props.loadBusinessListPopup}
          text='Business list deployed' />
        <Step done={false}
          text='White label wallet paired' />
      </div>
    )
  }
}

TokenProgress.propTypes = {
  token: PropTypes.object.isRequired
}

TokenProgress.defaultProps = {
  steps: {}
}

const mapDispatchToProps = {
  fetchTokenProgress
}

export default connect(
  null,
  mapDispatchToProps
)(TokenProgress)
