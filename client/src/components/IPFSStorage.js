import React, {Component} from 'react'
import * as api from 'services/api'


class IPFSStorage extends Component {
  state = {
    fileHash: '',
    fileContent: '',
    tokenData: {
      location: {
        geo: {
          lat: '',
          lng: ''
        },
        name: ''
      },
      image: '',
      description: '',
      website: '',
      social: '{"facebook": "www.facebook.com",  "twitter": "www.twitter.com"}'
    }
  }

  handleLatChange = (event) => this.setState({tokenData:
    {...this.state.tokenData,
      location: {...this.state.tokenData.location,
        geo: {
          ...this.state.tokenData.location.geo,
          lat: event.target.value}
      }
    }
  })

  handleLngChange = (event) => this.setState({tokenData:
    {...this.state.tokenData,
      location: {...this.state.tokenData.location,
        geo: {
          ...this.state.tokenData.location.geo,
          lng: event.target.value}
      }
    }
  })

  handleLocationNameChange = (event) => this.setState({tokenData:
    {...this.state.tokenData,
      location: {...this.state.tokenData.location,
        name: event.target.value
      }
    }
  })

  handleDescriptionChange = (event) => this.setState({tokenData: {...this.state.tokenData, description: event.target.value}})

  handleWebsiteChange = (event) => this.setState({tokenData: {...this.state.tokenData, website: event.target.value}})

  handleSocialChange = (event) => this.setState({tokenData: {...this.state.tokenData, social: event.target.value}})

  handleImageChange = (event) => this.setState({tokenData: {...this.state.tokenData, image: event.target.value}})

  handleFileHashChange = (event) => {
    const hash = event.target.value
    this.setState({fileHash: hash})

    api.fetchMetadata('ipfs', hash).then(({data}) => {
      this.setState({fileContent: JSON.stringify(data.data)})
    })
  }

  submitIPFS = () => {
    const tokenData = {...this.state.tokenData, social: JSON.parse(this.state.tokenData.social)}
    api.addMetadata(tokenData).then(({data}) => {
      this.setState({fileHash: data.hash})
      api.fetchMetadata(data.protocol, data.hash).then(({data}) => {
        this.setState({fileContent: JSON.stringify(data.data)})
      })
    })
  }

  render = () => (
    <div style={{textAlign: 'center'}}>
      <div>
        lat: <input type='text' value={this.state.tokenData.location.geo.lat} onChange={this.handleLatChange} />
      </div>
      <div>
        lng: <input type='text' value={this.state.tokenData.location.geo.lng} onChange={this.handleLngChange} />
      </div>
      <div>
        location name: <input type='text' value={this.state.tokenData.location.name} onChange={this.handleLocationNameChange} />
      </div>
      <div>
        description: <input type='text' value={this.state.tokenData.description} onChange={this.handleDescriptionChange} />
      </div>
      <div>
        website: <input type='text' value={this.state.tokenData.website} onChange={this.handleWebsiteChange} />
      </div>
      <div>
        social: <input type='text' value={this.state.tokenData.social} onChange={this.handleSocialChange} />
      </div>
      <div>
        image: <input type='text' value={this.state.tokenData.image} onChange={this.handleImageChange} />
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

export default IPFSStorage
