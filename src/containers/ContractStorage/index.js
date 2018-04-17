import React, {Component} from 'react'
import ipfs from 'services/ipfs'

const enc = new window.TextDecoder('utf-8')

class ContractStorage extends Component {
  state = {
  }

  componentDidMount = () => {
    if (this.props.metadata) {
      console.log('cat')
      ipfs.files.cat(this.props.metadata, (err, data) => {
        if (err) { throw err }
        this.setState({fileContent: enc.decode(data)})
      })
    }
  }

  render = () => (
    <div>
      <div>IPFS Storage</div>
      <div>metadata hash: {this.props.metadata}</div>
      <div>
        {this.state.fileContent}
      </div>
    </div>
  )
}

export default ContractStorage
