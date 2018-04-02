import React, {Component} from 'react'
import { connect } from 'react-redux'

import web3 from 'services/web3'
import {getNetwork} from 'actions'

class Network extends Component {
  componentDidMount () {
    this.props.getNetwork()
  }

  render () {
    return (
      <div>
        <div>version: {web3.version} </div>
        <div>network: {this.props.networkType} </div>
        <div>defaultAccount: {web3.eth.defaultAccount} </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => state.web3

export default connect(
  mapStateToProps, {
    getNetwork
  }
)(Network)
