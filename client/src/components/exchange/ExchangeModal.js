import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Modal from 'components/Modal'
import BuySellAmounts from 'components/exchange/BuySellAmounts'
import SummaryBuy from 'components/exchange/SummaryBuy'
import OpenMetamask from 'components/exchange/OpenMetamask'
import Pending from 'components/exchange/Pending'
import Completed from 'components/exchange/Completed'
import {getSelectedCommunity} from 'selectors/basicToken'

class InnerExchangeModal extends React.Component {
  onClose = () => this.props.uiActions.hideModal()
  componentWillMount() {
    this.props.uiActions.resetExchange()
  }
  renderStage = (buyStage) => {
    switch (buyStage) {
      case 1: {
        return <BuySellAmounts />
      }
      case 2: {
        return <SummaryBuy />
      }
      case 3: {
        return <OpenMetamask />
      }
      case 4: {
        return <Pending />
      }
      case 5: {
        return <Completed />
      }
      default: {
        return <BuySellAmounts />
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
  community: getSelectedCommunity(state),
  buyStage: state.ui.buyStage,
})

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeModal)
