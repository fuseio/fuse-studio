import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Modal from 'components/Modal'
import BuySellAmounts from 'components/exchange/BuySellAmounts'
import SummaryBuy from 'components/exchange/SummaryBuy'
import OpenMetamask from 'components/exchange/OpenMetamask'
import Pending from 'components/exchange/Pending'
import {getCommunities} from 'selectors/basicToken'
import find from 'lodash/find'

class InnerExchangeModal extends React.Component {

  onClose = () => this.props.uiActions.hideModal()

  renderStage = (buyStage) => {
    switch(buyStage) {
      case 1: {
        return <BuySellAmounts />
        break
      }
      case 2: {
        return <SummaryBuy />
        break
      }
      case 3: {
        return <OpenMetamask />
        break
      }
      case 4: {
        return <Pending />
        break
      }
      default: {
        return <BuySellAmounts />
        break
      }
    }
  }
  render () {
    const { buyStage } = this.props

    return (
      <Modal class='fullscreen' onClose={this.onClose} width='500px'>
        {this.renderStage(buyStage)}
      </Modal>
    )
  }
}

const ExchangeModal = (props) => (
  props.community && props.community.isMarketMakerLoaded
    ? <InnerExchangeModal {...props} />
    : null
)

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: find(getCommunities(state), {address: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91'}),
  buyStage: state.ui.buyStage
})

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeModal)
