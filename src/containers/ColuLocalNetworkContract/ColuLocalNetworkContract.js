import React, {Component} from 'react'
import { connect } from 'react-redux'

import BasicTokenContract from 'containers/BasicTokenContract'
import { transfer } from 'actions/basicToken'

class ColuLocalNetworkContract extends Component {
  render = () => (
    <BasicTokenContract
      contractName={'ColuLocalNetwork'}
      contract={this.props.contract}
    />
  )
}

const mapStateToProps = (state) => ({contract: state.basicToken})

export default connect(
  mapStateToProps, {
    transfer
  }
)(ColuLocalNetworkContract)
