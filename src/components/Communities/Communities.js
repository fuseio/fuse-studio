import React, {Component} from 'react'
import BasicTokenContract from 'containers/BasicTokenContract'
import CurrencyFactoryContract from 'containers/CurrencyFactoryContract'

class Communities extends Component {
  render () {
    return (<div>
      <CurrencyFactoryContract />
      <BasicTokenContract />
    </div>)
  }
}

export default Communities
