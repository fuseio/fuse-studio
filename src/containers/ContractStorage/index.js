import React, {Component} from 'react'
import ipfs from 'services/ipfs'

const enc = new window.TextDecoder('utf-8')

class ContractStorage extends Component {
  state = {
    metadata: ''
  }

  catIpfs = () => {
    try {
      ipfs.files.cat(this.props.metadata, (err, data) => {
        if (err) { throw err }
        this.setState({fileContent: enc.decode(data)})
      })
    } catch (e) {
      console.log(e)
    }
  }
  componentDidMount = () => {
    if (this.props.metadata) {
      this.catIpfs()
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.metadata !== this.props.metadata) {
      this.catIpfs()
    }
  }

  handleMetadataChange = (event) => this.setState({metadata: event.target.value})

  handleSetMetadata = () => this.props.setMetadata(this.props.address, this.state.metadata)

  render = () => (
    <div>
      <div>IPFS Storage</div>
      <div>metadata hash: {this.props.metadata}</div>
      setMetadata: <input type='text' value={this.state.metadata} onChange={this.handleMetadataChange} />
      <button onClick={this.handleSetMetadata}>submit</button>
      <div>
        {this.state.fileContent}
      </div>
    </div>
  )
}

export default ContractStorage
