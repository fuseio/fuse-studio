import React, {Component} from 'react'
import web3, {data} from 'services/web3'

class Network extends Component {
  render () {
    return (
      <div>
        <div>version: {web3.version} </div>
        <div>network: {data.network} </div>
        <div>defaultAccount: {web3.eth.defaultAccount} </div>
        <div> time: {this.props.time} </div>
      </div>
    )
  }
}

export default Network
