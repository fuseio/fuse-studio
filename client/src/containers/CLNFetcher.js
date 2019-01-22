import {Component} from 'react'
import { connect } from 'react-redux'
import {fetchClnToken} from 'actions/token'

class CLNFethcher extends Component {
  componentDidMount () {
    this.props.fetchClnToken()
  }

  render = () => null
}

const mapDispatchToProps = {
  fetchClnToken
}

export default connect(null, mapDispatchToProps)(CLNFethcher)
