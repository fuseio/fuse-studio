import {Component} from 'react'
import { connect } from 'react-redux'
import {fetchClnToken} from 'actions/communities'
import {fetchTokenQuote} from 'actions/fiat'

class CLNFethcher extends Component {
  componentDidMount () {
    this.props.fetchClnToken()
    this.props.fetchTokenQuote('CLN', 'USD')
  }

  render = () => null
}

const mapDispatchToProps = {
  fetchTokenQuote,
  fetchClnToken
}

export default connect(null, mapDispatchToProps)(CLNFethcher)
