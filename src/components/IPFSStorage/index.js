import React, {Component} from 'react'
import ipfs from 'services/ipfs'

const enc = new window.TextDecoder('utf-8')

class IPFSStorage extends Component {
  state = {
    fileHash: '',
    fileContent: '',
    tokenData: {
      lat: '',
      lng: '',
      title: ''
    }
  }

  handleLatChange = (event) => this.setState({tokenData: {...this.state.tokenData, lat: event.target.value}})

  handleLngChange = (event) => this.setState({tokenData: {...this.state.tokenData, lng: event.target.value}})

  handleTitleChange = (event) => this.setState({tokenData: {...this.state.tokenData, title: event.target.value}})

  handleFileHashChange = (event) => {
    const hash = event.target.value
    this.setState({fileHash: hash})

    ipfs.files.cat(hash, (err, data) => {
      if (err) { throw err }
      debugger
      this.setState({fileContent: enc.decode(data)})
    })
  }

  submitIPFS = () => {
    const self = this

    ipfs.files.add([Buffer.from(JSON.stringify(this.state.tokenData))], (err, filesAdded) => {
      if (err) { throw err }

      const hash = filesAdded[0].hash
      self.setState({fileHash: hash})

      ipfs.files.cat(hash, (err, data) => {
        if (err) { throw err }
        self.setState({fileContent: enc.decode(data)})
      })
    })
  }

  render () {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>Everything is working!</h1>
        <div>
          lat: <input type='text' value={this.state.tokenData.lat} onChange={this.handleLatChange} />
        </div>
        <div>
          lng: <input type='text' value={this.state.tokenData.lng} onChange={this.handleLngChange} />
        </div>
        <div>
          title: <input type='text' value={this.state.tokenData.title} onChange={this.handleTitleChange} />
        </div>
        <button onClick={this.submitIPFS}>submit IPFS</button>
        <hr />
        <div>
          Added a file: <br />
          <input type='text' value={this.state.fileHash} onChange={this.handleFileHashChange} />
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.fileContent}
        </p>
      </div>
    )
  }
}

export default IPFSStorage
