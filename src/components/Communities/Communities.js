import React, {Component} from 'react'
import ColuLocalCurrencyContract from 'containers/ColuLocalCurrencyContract'
import ColuLocalNetworkContract from 'containers/ColuLocalNetworkContract'
import CurrencyFactoryContract from 'containers/CurrencyFactoryContract'

class Communities extends Component {
  render () {
    return (<div>
      <CurrencyFactoryContract />
      <ColuLocalNetworkContract />
      <ColuLocalCurrencyContract />
    </div>)
  }
}

export default Communities
