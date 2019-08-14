import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchFuseToken } from 'actions/token'

class FuseFetcher extends Component {
  componentDidMount () {
    if (this.props.networkType !== 'fuse') {
      this.props.fetchFuseToken()
    }
  }

  render = () => null
}

FuseFetcher.propTypes = {
  networkType: PropTypes.string.isRequired
}

const mapDispatchToProps = {
  fetchFuseToken
}

export default connect(null, mapDispatchToProps)(FuseFetcher)
