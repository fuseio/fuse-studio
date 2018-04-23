import React, {Component} from 'react'
import { connect } from 'react-redux'

import Network from 'containers/Network'
import Communities from 'components/Communities'
import IPFSStorage from 'components/IPFSStorage'
import {fetchSupportsToken} from 'actions'
import {name, balanceOf, transfer, fetchContractData} from 'actions/basicToken'

// const ColuLocalNetworkContract = contract.getContract({contractName: 'ColuLocalNetwork'})

const clnAddress = '0x41C9d91E96b933b74ae21bCBb617369CBE022530'

const coluTokens = [
  clnAddress,
  '0x296582CAb0e44009d2142D7daf33C81f153407F8',
  '0x3355e0C28D759d6d4eF649EF3a6dba11402d1a7f'
]

class App extends Component {
  componentDidMount () {
    coluTokens.forEach(this.props.fetchContractData)
    // this.props.fetchContractData(clnAddress)
    this.props.fetchSupportsToken(clnAddress, '0x41C9d91E96b933b74ae21bCBb617369CBE022530')
    // this.props.name(clnAddress)
    this.props.balanceOf(clnAddress, '0x0d4DF041Dbef6fFC0E444a4a213774AdB0c118C2')
  }

  render () {
    return <div>
      <Network />
      <Communities />
      <IPFSStorage />
    </div>
  }
}

const mapStateToProps = (state) => state

export default connect(
  mapStateToProps, {
    fetchSupportsToken,
    name,
    balanceOf,
    transfer,
    fetchContractData
  }
)(App)
