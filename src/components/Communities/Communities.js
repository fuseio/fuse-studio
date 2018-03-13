import React, {Component} from 'react'
import web3 from 'services/web3'
import Network from 'components/Network'
import CLN from 'components/CLN'


class Communities extends Component {
  constructor (props) {
    super(props)
    setInterval(() => {
      this.setState({time: Date()})
    }, 1000)
    this.state = {
      time: Date()
    }
  }

  render () {
    return (<div>
      Communities
      <Network time={this.state.time} />
      <CLN time={this.state.time} />
    </div>)
  }
}

export default Communities
