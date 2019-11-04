import { Component } from 'react'
import { connect } from 'react-redux'
import { getNetworkType, checkAccountChanged } from 'actions/network'
import { loadModal } from 'actions/ui'
import { isNetworkSupported } from 'utils/network'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { withMaybe } from 'utils/components'
import { getAccountAddress } from 'selectors/accounts'
import { loadState } from 'utils/storage'

class Web3 extends Component {
  connectToNetwork = () => {
    const networkState = loadState('state.network')
    const { getNetworkType } = this.props
    if (networkState && networkState.networkType) {
      getNetworkType(true)
    } else {
      getNetworkType()
    }
    // TODO: Move this to getNetworkType saga after redux-saga 1.0.0 upgrade
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts[0]) {
          this.props.checkAccountChanged(accounts[0])
        }
      })
    }
  }

  componentDidMount () {
    const { isMobile } = this.props
    if (isMobile) {
      const interval = setInterval(() => {
        if (window && window.pk) {
          this.connectToNetwork()
          clearInterval(interval)
        }
      }, 100)
    } else {
      // this.connectToNetwork()
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

  const ConnectedComponent = connect(mapStateToProps)(Component)
  return ConnectedComponent
}

const withAccount = (Component) => {
  const mapStateToProps = (state) => ({
    accountAddress: getAccountAddress(state)
  })

  const ConnectedComponent = connect(mapStateToProps)(withMaybe(props => props.accountAddress)(Component))
  return ConnectedComponent
}

const withBox = (Component) => {
  const mapStateToProps = (state) => ({
    isBoxConnected: state.network.isBoxConnected
  })

  const ConnectedComponent = connect(mapStateToProps)(withMaybe(props => props.isBoxConnected)(Component))
  return ConnectedComponent
}

export { withNetwork, withAccount, withBox }
