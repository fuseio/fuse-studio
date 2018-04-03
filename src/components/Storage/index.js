import React, {Component} from 'react'
import ipfs from 'services/ipfs'

const enc = new window.TextDecoder('utf-8')

class Storage extends Component {
  state = {
    added_file_hash: null,
    added_file_contents: null,
    tokenData: {
      lat: '',
      lng: '',
      title: ''
    }
  }

  handleLatChange = (event) => this.setState({tokenData: {...this.state.tokenData, lat: event.target.value}})

  handleLngChange = (event) => this.setState({tokenData: {...this.state.tokenData, lng: event.target.value}})

  handleTitleChange = (event) => this.setState({tokenData: {...this.state.tokenData, title: event.target.value}})

  submitIPFS = () => {
    const self = this

    ipfs.files.add([Buffer.from(JSON.stringify(this.state.tokenData))], (err, filesAdded) => {
      if (err) { throw err }

      const hash = filesAdded[0].hash
      self.setState({added_file_hash: hash})

      ipfs.files.cat(hash, (err, data) => {
        if (err) { throw err }
        self.setState({added_file_contents: enc.decode(data)})
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
          {this.state.added_file_hash}
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.added_file_contents}
        </p>
      </div>
    )
  }
}

export default Storage
