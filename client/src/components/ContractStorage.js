import React, {Component} from 'react'

class ContractStorage extends Component {
  state = {
    tokenURI: '',
    address: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91',
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
