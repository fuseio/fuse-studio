import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CommunityLogo from 'components/elements/CommunityLogo'
import {fetchTokenProgress} from 'actions/token'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'

const Step = ({done, text, handleClick}) => (
  <div
    className={classNames('dashboard-progress-text', {
      'text-positive': done,
      'text-negative': !done
    })}
    onClick={done ? null : handleClick}
  >
    <FontAwesome name={classNames({'check': done, 'minus': !done})} /> <span className='progress-text-content'>{text}</span>
  </div>)

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
    const steps = this.props.steps
    const doneSteps = Object.values(steps).filter(step => step)
    const progressOverall = doneSteps.length * 20
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
        <Step done={steps.tokenIssued}
          text='Community token deployed' />
        <Step done={steps.detailsGiven} handleClick={this.props.loadUserDataModal}
          text='Admin personal name given' />
        <Step done={steps.bridgeDeployed} handleClick={this.props.loadBridgePopup}
          text='Bridge to Fuse - chain deployed' />
        <Step done={steps.businessListDeployed} handleClick={this.props.loadBusinessListPopup}
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
