import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchClnToken } from 'actions/token'

class CLNFethcher extends Component {
  componentDidMount () {
    if (this.props.networkType !== 'fuse') {
      this.props.fetchClnToken()
    }
  }

  render = () => null
}

CLNFethcher.propTypes = {
  networkType: PropTypes.string.isRequired
}

const mapDispatchToProps = {
  fetchClnToken
}

export default connect(null, mapDispatchToProps)(CLNFethcher)
