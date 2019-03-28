import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CommunityLogo from 'components/elements/CommunityLogo'
import {fetchTokenProgress} from 'actions/token'
import FontAwesome from 'react-fontawesome'

class TokenProgress extends Component {
  componentDidMount () {
    this.props.fetchTokenProgress(this.props.match.params.address)
  }
  loadPersonalDetailsModal = (steps) => {
    if (!steps.detailsGiven) {
      this.props.loadUserDataModal()
    }
  }
  loadBridgeModal = (steps) => {
    if (!steps.bridgeDeployed) {
      this.props.loadBridgePopup()
    }
  }
  render () {
    const { token } = this.props
    const steps = this.props.steps !== undefined ? this.props.steps : { tokenIssued: false, bridgeDeployed: false, detailsGiven: false }
    const filteredSteps = Object.keys(steps).filter(step => steps[step])
    const progressOverall = filteredSteps.length * 20
    return (
      <div className='dashboard-sidebar'>
        <CommunityLogo token={token} metadata={this.props.metadata[token.tokenURI] || {}} />
        <h3 className='dashboard-title'>{token.name}</h3>
        <div className='dashboard-progress'>
          <div className={`dashboard-progress-bar-${progressOverall}`} />
          <div className='dashboard-progress-content'>
            <div className='dashboard-progress-title'>Overall progress</div>
            <div className='dashboard-progress-percent'>{progressOverall}%</div>
          </div>
        </div>
        <div className={steps.tokenIssued ? 'dashboard-progress-text text-positive' : 'dashboard-progress-text text-negative'}>
          <FontAwesome name={steps.tokenIssued ? 'check' : 'minus'} /> <span className='progress-text-content'>Deploy a token</span>
        </div>
        <div
          className={steps.detailsGiven ? 'dashboard-progress-text text-positive' : 'dashboard-progress-text text-negative'}
          onClick={() => this.loadPersonalDetailsModal(steps)}
        >
          <FontAwesome name={steps.detailsGiven ? 'check' : 'minus'} /> <span className='progress-text-content'>Personal details</span>
        </div>
        <div
          className={steps.bridgeDeployed ? 'dashboard-progress-text text-positive' : 'dashboard-progress-text text-negative'}
          onClick={() => this.loadBridgeModal(steps)}
        >
          <FontAwesome name={steps.bridgeDeployed ? 'check' : 'minus'} /> <span className='progress-text-content'>Deploy a bridge to Fuse-chain</span>
        </div>
        <div
          className='dashboard-progress-text text-negative'
          onClick={this.props.loadBusinessListPopup}
        >
          <FontAwesome name='minus' /> <span className='progress-text-content'>Link to add a business list</span>
        </div>
        <div className='dashboard-progress-text text-negative'>
          <FontAwesome name='minus' /> <span className='progress-text-content'>Plug into a white label wallet</span>
        </div>
      </div>
    )
  }
}

TokenProgress.propTypes = {
  token: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  fetchTokenProgress
}

export default connect(
  null,
  mapDispatchToProps
)(TokenProgress)
