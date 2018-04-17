import React, {Component} from 'react'
import { connect } from 'react-redux'

import BasicTokenContract from 'containers/BasicTokenContract'
import ContractStorage from 'containers/ContractStorage'
import { metadata } from 'actions/basicToken'

class ColuLocalCurrencyContract extends Component {
  state ={
    address: '0x43260f716e81701720ADcbb0De2C564799419D95',
    open: true
  }

  componentDidMount = () => {
    this.props.metadata(this.state.address)
  }

  handleAddressChange = (event) => {
    this.setState({address: event.target.value})
  }

  handleLoadContract = () => {
    this.setState({open: true})
  }

  render = () => (
    <div>
      <span>Local Currency address: </span>
      <input type='text' value={this.state.address} onChange={this.handleAddressChange} />
      <button onClick={this.handleLoadContract}>load</button>
      {this.state.open &&
        <div>
          <BasicTokenContract
            contractName='ColuLocalCurrency'
            address={this.state.address}
            contract={this.props.tokens[this.state.address]} />
          {
            this.state.address && this.props.tokens[this.state.address] && this.props.tokens[this.state.address].metadata &&
            <ContractStorage
              metadata={this.props.tokens[this.state.address].metadata}
              address={this.state.address}
            />
          }

        </div>
      }
    </div>
  )
}

const mapStateToProps = (state) => ({tokens: state.tokens})

export default connect(
  mapStateToProps, {
    metadata
  }
)(ColuLocalCurrencyContract)
