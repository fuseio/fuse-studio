import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { quote, change } from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import Modal from 'components/Modal'
import {BigNumber} from 'bignumber.js'
import {getQuotePair} from 'selectors/marketMaker'

class InnerExchangeModal extends React.Component {
  state = {
    cln: '1e20',
    toCC: true
  }

  onClose = () => this.props.uiActions.hideModal()

  // quoteCCtoCLN = () => {
  //   this.props.quote(this.props.ccAddress, new BigNumber('31038481756201995358'), this.props.clnAddress)
  // }
  //
  // quoteCLNtoCC = () => {
  //   this.props.quote(this.props.ccAddress, new BigNumber('1e20'), this.props.clnAddress)
  // }

  changeCCtoCLN = () => {
    this.props.change(this.props.ccAddress, new BigNumber(this.state.cc), this.props.clnAddress)
    // this.props.quote(this.props.ccAddress, new BigNumber('1e21'), this.props.clnAddress)
  }

  changeCLNtoCC = () => {
    this.props.change(this.props.clnAddress, new BigNumber(this.state.cln), this.props.ccAddress)
    // this.props.quote(this.props.ccAddress, new BigNumber('1e21'), this.props.clnAddress)
  }

  handleCLNInput = (event) => {
    this.setState({cln: event.target.value})
    this.setState({toCC: true})
    this.props.quote(this.props.clnAddress, new BigNumber(event.target.value), this.props.ccAddress)
  }

  handleCCInput = (event) => {
    this.setState({cc: event.target.value})
    this.setState({toCC: false})
    this.props.quote(this.props.ccAddress, new BigNumber(event.target.value), this.props.clnAddress)
  }

  componentDidMount () {
    if (this.state.toCC) {
      this.props.quote(this.props.clnAddress, new BigNumber(this.state.cln), this.props.ccAddress)
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.quotePair !== this.props.quotePair) {
      if (this.state.toCC) {
        this.setState({cc: nextProps.quotePair.outAmount})
      } else {
        this.setState({cln: nextProps.quotePair.outAmount})
      }
    }
  }

  render () {
    return (
      <Modal onClose={this.onClose}>
        <h4>{'Exchange CC'}</h4>
        <div><button onClick={this.changeCCtoCLN}>exchange CC to CLN</button></div>
        <div><button onClick={this.changeCLNtoCC}>exchange CLN to CC</button></div>

        <div>CLN: <input type='text' value={this.state.cln} onChange={this.handleCLNInput} /></div>
        <div>TLV: <input type='text' value={this.state.cc} onChange={this.handleCCInput} /></div>
      </Modal>
    )
  }
}

InnerExchangeModal.propTypes = {
  ccAddress: PropTypes.string.isRequired,
  clnAddress: PropTypes.string.isRequired
}

InnerExchangeModal.defaultProps = {
  ccAddress: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91',
  clnAddress: '0x41C9d91E96b933b74ae21bCBb617369CBE022530'
}

const ExchangeModal = (props) => (
  props.community && props.community.isMarketMakerLoaded
    ? <InnerExchangeModal {...props} />
    : null
)

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  quote: bindActionCreators(quote, dispatch),
  change: bindActionCreators(change, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: state.tokens['0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91'],
  quotePair: state.marketMaker.quotePair
  // quotePair: getQuotePair(state, {toToken: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91', fromToken: '0x41C9d91E96b933b74ae21bCBb617369CBE022530'})
})

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeModal)
