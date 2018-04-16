import React, {Component} from 'react'
import { connect } from 'react-redux'

import BasicTokenContract from 'containers/BasicTokenContract'
import { transfer } from 'actions/basicToken'

class ColuLocalCurrencyContract extends Component {
  state ={
    address: ''
  }

  handleAddressChange = (event) => {
    this.setState({address: event.target.value})
  }

  handleLoadContract = () => {

  }

  render = () => (
    <div>
      <span>Local Currency address: </span>
      <input type='text' value={this.state.address} onChange={this.handleAddressChange} />
      <button onClick={this.handleLoadContract}>load</button>
      {this.props.contract && <BasicTokenContract
        contractName='ColuLocalCurrency'
        contract={this.props.contract}
      />}
    </div>
  )
}

const mapStateToProps = (state) => ({contract: state.basicToken})

export default connect(
  mapStateToProps, {
    transfer
  }
)(ColuLocalCurrencyContract)
