import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getNetworkType } from 'actions/network'
class MobileProvider extends Component {

  goToHome = () => {
    window.pk = '0x21fe9b6d21b285d8894e9471c89430aacad1876b3195a03ad1dd46cecf6075e5'
    // window.history.pushState({}, 'index', '/')
    // window.location.replace(window.origin);
    // debugger
    const { history, getNetworkType } = this.props

    this.props.history.push('/')
    getNetworkType()
    // history.onLocationChanged('/view/issuance', '@@router/LOCATION_CHANGE', true)
  }

  componentDidMount () {
    // this.props.fetchFuseToken()
    // history.push('/view/issuance')
    const interval = setTimeout(() => {
      debugger
      window.pk = '0x21fe9b6d21b285d8894e9471c89430aacad1876b3195a03ad1dd46cecf6075e5'
      if (window && window.pk) {
        clearInterval(interval)
        this.goToHome()
      }
    }, 100)
  }

  render = () => <button onClick={this.goToHome}>ha</button>
}

const mapDispatchToProps = {
  push,
  getNetworkType
}

export default connect(null, mapDispatchToProps)(MobileProvider)
