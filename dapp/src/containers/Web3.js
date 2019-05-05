import { Component } from 'react'
import { connect } from 'react-redux'
import { getNetworkType, checkAccountChanged } from 'actions/network'
import { loadModal } from 'actions/ui'
import { isNetworkSupported } from 'utils/network'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { withMaybe } from 'utils/components'

class Web3 extends Component {
  componentDidMount () {
    this.props.getNetworkType()
    // TODO: Move this to getNetworkType saga after redux-saga 1.0.0 upgrade
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts[0]) {
          this.props.checkAccountChanged(accounts[0])
        }
      })
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.networkType !== this.props.networkType && !isNetworkSupported(nextProps.networkType)) {
      this.props.loadModal(WRONG_NETWORK_MODAL)
    }
  }

  render = () => null
}

const mapStateToProps = state => ({
  networkType: state.network.networkType
})

const mapDispatchToProps = {
  getNetworkType,
  checkAccountChanged,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(Web3)

const withNetwork = (Component) => {
  const mapStateToProps = (state) => ({
    networkType: state.network.networkType
  })

  const ConnectedComponent = connect(mapStateToProps)(withMaybe(props => props.networkType)(Component))
  return ConnectedComponent
}

export { withNetwork }
