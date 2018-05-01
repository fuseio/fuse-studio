import React, {Component} from 'react'
import * as api from 'services/api'

const enc = new window.TextDecoder('utf-8')

class IPFSStorage extends Component {
  state = {
    fileHash: '',
    fileContent: '',
    tokenData: {
      location: {
        lat: '',
        lng: ''
      },
      description: '',
      website: '',
      social: [

      ]
    }
  }

  handleLatChange = (event) => this.setState({tokenData:
    {...this.state.tokenData, location: {...this.state.tokenData.location, lat: event.target.value}}})

  handleLngChange = (event) => this.setState({tokenData:
    {...this.state.tokenData, location: {...this.state.tokenData.location, lng: event.target.value}}})

  handleDescriptionChange = (event) => this.setState({tokenData: {...this.state.tokenData, description: event.target.value}})

  handleWebsiteChange = (event) => this.setState({tokenData: {...this.state.tokenData, website: event.target.value}})

  handleFileHashChange = (event) => {
    const hash = event.target.value
    this.setState({fileHash: hash})

    api.fetchMetadata(hash).then(({data}) => {
      this.setState({fileContent: JSON.stringify(data.data)})
    })
  }

  submitIPFS = () => {
    const self = this

    api.addMetadata(this.state.tokenData).then(({data}) => {
      self.setState({fileHash: data.hash})
      api.fetchMetadata(data.hash).then(({data}) => {
        this.setState({fileContent: JSON.stringify(data.data)})
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
          description: <input type='text' value={this.state.tokenData.description} onChange={this.handleDescriptionChange} />
        </div>
        <div>
          website: <input type='text' value={this.state.tokenData.website} onChange={this.handleWebsiteChange} />
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
