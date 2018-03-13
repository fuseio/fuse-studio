import React, {Component} from 'react'
import {data} from 'services/web3'

class CLN extends Component {
  handleClick () {

  }

  render () {
    // console.log(data)
    return <div>
      <div>CLN: {data.name} </div>
      <div>supportsToken: {data.supportsToken ? 'yes' : 'no'}</div>
      <button onClick={this.handleClick}>get CLN</button>
    </div>
  }
}

export default CLN
