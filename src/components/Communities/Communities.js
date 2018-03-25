import React, {Component} from 'react'
import Network from 'containers/Network'
import Contract from 'containers/Contract'

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
      <Network time={this.state.time} />
      <Contract />
    </div>)
  }
}

export default Communities
