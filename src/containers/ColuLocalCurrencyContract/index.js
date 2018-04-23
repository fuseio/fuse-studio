import React, {Component} from 'react'
import { connect } from 'react-redux'

import BasicTokenContract from 'containers/BasicTokenContract'
import ContractStorage from 'containers/ContractStorage'
import { metadata, setMetadata } from 'actions/basicToken'

class ColuLocalCurrencyContract extends Component {
  state ={
    address: '0x296582CAb0e44009d2142D7daf33C81f153407F8',
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
    this.props.metadata(this.state.address)
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
            this.state.address && this.props.tokens[this.state.address] &&
            <ContractStorage
              metadata={this.props.tokens[this.state.address].metadata}
              setMetadata={this.props.setMetadata}
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
    metadata,
    setMetadata
  }
)(ColuLocalCurrencyContract)
