import React, {Component} from 'react'

class ContractStorage extends Component {
  state = {
    tokenURI: '',
    address: '0x4188bA0bFDA56254ac66C54B1998007188c43D8C',
    clnAmount: ''
  }

  handleTokenURIChange = (event) => this.setState({tokenURI: event.target.value})

  handleAddressChange = (event) => this.setState({address: event.target.value})

  handleClnAmountChange = (event) => this.setState({clnAmount: event.target.value})

  handleSetTokenURI = () => this.props.setTokenURI(this.state.address, this.state.tokenURI)

  handleInsertCLNtoMarketMaker = () => this.props.insertCLNtoMarketMaker(this.state.address, this.state.clnAmount)

  render = () => (
    <div>
      <div>IPFS Storage</div>
      address: <input type='text' value={this.state.address} onChange={this.handleAddressChange} />
      tokenURI: <input type='text' value={this.state.tokenURI} onChange={this.handleTokenURIChange} />
      <button onClick={this.handleSetTokenURI}>set</button>
      <div>
        clnAmount: <input type='text' value={this.state.clnAmount} onChange={this.handleClnAmountChange} />
        <button onClick={this.handleInsertCLNtoMarketMaker}>insert</button>
      </div>
      <div>
        {this.state.fileContent}
      </div>
    </div>
  )
}

export default ContractStorage
