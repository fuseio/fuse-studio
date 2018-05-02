import React, {Component} from 'react'

const enc = new window.TextDecoder('utf-8')

class ContractStorage extends Component {
  state = {
    tokenURI: '',
    address: ''
  }

  catIpfs = () => {
    // try {
    //   ipfs.files.cat(this.props.metadata, (err, data) => {
    //     if (err) { throw err }
    //     this.setState({fileContent: enc.decode(data)})
    //   })
    // } catch (e) {
    //   console.log(e)
    // }
  }
  componentDidMount = () => {
    if (this.props.tokenURI) {
      this.catIpfs()
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.tokenURI !== this.props.tokenURI) {
      this.catIpfs()
    }
  }

  handleTokenURIChange = (event) => this.setState({tokenURI: event.target.value})

  handleAddressChange = (event) => this.setState({address: event.target.value})

  handleSetTokenURI = () => this.props.setTokenURI(this.state.address, this.state.tokenURI)

  render = () => (
    <div>
      <div>IPFS Storage</div>
      address: <input type='text' value={this.state.address} onChange={this.handleAddressChange} />
      tokenURI: <input type='text' value={this.state.tokenURI} onChange={this.handleTokenURIChange} />
      <button onClick={this.handleSetTokenURI}>set</button>
      <div>
        {this.state.fileContent}
      </div>
    </div>
  )
}

export default ContractStorage
