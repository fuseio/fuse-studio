import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { quote, change } from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import Modal from 'components/Modal'
import {BigNumber} from 'bignumber.js'

class ExchangeModal extends React.Component {
  onClose = () => {
    this.props.uiActions.hideModal()
  }

  quoteCCtoCLN = () => {
    this.props.quote(this.props.ccAddress, new BigNumber('31038481756201995358'), this.props.clnAddress)
  }

  quoteCLNtoCC = () => {
    this.props.quote(this.props.ccAddress, new BigNumber('1e20'), this.props.clnAddress)
  }

  changeCCtoCLN = () => {
    this.props.change(this.props.ccAddress, new BigNumber('31038481756201995358'), this.props.clnAddress)
    // this.props.quote(this.props.ccAddress, new BigNumber('1e21'), this.props.clnAddress)
  }

  changeCLNtoCC = () => {
    this.props.change(this.props.clnAddress, new BigNumber('1e21'), this.props.ccAddress)
    // this.props.quote(this.props.ccAddress, new BigNumber('1e21'), this.props.clnAddress)
  }

  componentDidMount = () => {
    // setTimeout(() => {
    //   this.props.quote(this.props.ccAddress, new BigNumber('1e21'), this.props.clnAddress)
    // }, 1500)
    // setTimeout(() => {
    //   this.props.change(this.props.clnAddress, new BigNumber('1e21'), this.props.ccAddress)
    // }, 2500)

    // setTimeout(() => {
    //   this.props.change(this.props.ccAddress, new BigNumber('3103848175620199535803'), this.props.clnAddress)
    // }, 2500)
  }
  render () {
    return (
      <Modal onClose={this.onClose}>
        <h4>{'Exchange CC'}</h4>
        <div><button onClick={this.quoteCCtoCLN}>quote CC to CLN</button></div>
        <div><button onClick={this.quoteCLNtoCC}>quote CLN to CC</button></div>
        <div><button onClick={this.changeCCtoCLN}>exchange CC to CLN</button></div>
        <div><button onClick={this.changeCLNtoCC}>exchange CLN to CC</button></div>
      </Modal>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  quote: bindActionCreators(quote, dispatch),
  change: bindActionCreators(change, dispatch)
})

ExchangeModal.propTypes = {
  ccAddress: PropTypes.string.isRequired,
  clnAddress: PropTypes.string.isRequired
}

ExchangeModal.defaultProps = {
  ccAddress: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91',
  clnAddress: '0x41C9d91E96b933b74ae21bCBb617369CBE022530'
}

export default connect(null, mapDispatchToProps)(ExchangeModal)
