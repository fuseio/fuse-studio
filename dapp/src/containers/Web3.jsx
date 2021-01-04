import { connect } from 'react-redux'
import { getCurrentNetworkType } from 'selectors/network'
import { withMaybe } from 'utils/components'
import { getAccountAddress } from 'selectors/accounts'

const withNetwork = (Component) => {
  const mapStateToProps = (state) => ({
    networkType: getCurrentNetworkType(state)
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

export { withNetwork, withAccount }
