import React, {Component} from 'react'
import { connect } from 'react-redux'

import {onWeb3Ready} from 'services/web3'
import {getNetworkType, setReadyStatus} from 'actions/web3'

class Web3Loader extends React.Component {

  componentDidMount() {
      this.props.getNetworkType()
      onWeb3Ready.then(({web3}) => {
        this.props.setReadyStatus(true, web3.eth.defaultAccount)
      })
  }

  render = () => (
    <div>
      {this.props.children}
    </div>
  )
}

const mapStateToProps = (state) => ({state: state.web3})

export default connect(
  mapStateToProps, {
    getNetworkType,
    setReadyStatus
  }
)(Web3Loader)
