import React, {Component} from 'react'
import { connect } from 'react-redux'

import BasicTokenContract from 'containers/BasicTokenContract'
import { transfer } from 'actions/basicToken'

const clnAddress = '0x41C9d91E96b933b74ae21bCBb617369CBE022530'

class ColuLocalNetworkContract extends Component {
  render = () => (
    <BasicTokenContract
      contractName={'ColuLocalNetwork'}
      contract={this.props.contract}
      address={clnAddress}
    />
  )
}

const mapStateToProps = (state) => ({contract: state.tokens[clnAddress]})

export default connect(
  mapStateToProps, {
    transfer
  }
)(ColuLocalNetworkContract)
