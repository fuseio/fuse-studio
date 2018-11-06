import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import Community from 'components/Community'

class ExpandableCommunity extends Component {
  handleOpen = () => this.props.handleCommunityClick(this.props.token.address)

  handleClose = () => this.props.handleCommunityClick(null)

  render = () => <div className='list-item'>
    <Community {...this.props} handleOpen={this.handleOpen} />
    <div className='coin-footer-close' onClick={this.handleClose}>
      <FontAwesome name='times-circle' /> Close
    </div>
  </div>
}

ExpandableCommunity.propTypes = {
  handleCommunityClick: PropTypes.func.isRequired,
  token: PropTypes.object
}

export default ExpandableCommunity
