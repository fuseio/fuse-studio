import React, {Component} from 'react'
import { connect } from 'react-redux'

import web3 from 'services/web3/web3'
import { getNetworkName } from 'services/web3/utils'
import {getNetwork} from 'actions'

class Network extends Component {
  componentDidMount () {
    this.props.getNetwork()
  }

  render () {
    return (
      <div>
        <div>version: {web3.version} </div>
        <div>network: {getNetworkName(this.props.netId)} </div>
        <div>defaultAccount: {web3.eth.defaultAccount} </div>
        <div> time: {this.props.time} </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => state.contract

export default connect(
  mapStateToProps, {
    getNetwork
  }
)(Network)
