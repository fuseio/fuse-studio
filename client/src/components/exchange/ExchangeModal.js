import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import Modal from 'components/Modal'
import BuySellAmounts from 'components/exchange/BuySellAmounts'
import Summary from 'components/exchange/Summary'
import OpenMetamask from 'components/exchange/OpenMetamask'
import Pending from 'components/exchange/Pending'
import Completed from 'components/exchange/Completed'
import {getSelectedCommunity} from 'selectors/basicToken'
import {getSelectedCommunityBalance, getClnBalance} from 'selectors/accounts'
import {withMaybe} from 'utils/components'
import { isBrowser } from 'react-device-detect'

const EXCHANGE_COMPONENTS = {
  1: (props) => <BuySellAmounts {...props} />,
  2: (props) => <Summary {...props} />,
  3: (props) => <OpenMetamask {...props} />,
  4: (props) => <Pending {...props} />,
  5: (props) => <Completed {...props} />
}

class ExchangeModal extends React.Component {
  onClose = () => this.props.uiActions.hideModal()

  setBuyStage = (buyStage) => this.props.uiActions.updateModalProps({buyStage})

  next = () => this.setBuyStage(this.props.buyStage + 1)
  back = () => this.setBuyStage(this.props.buyStage - 1)

  render () {
    const { buyStage } = this.props
    const ExchangeComponent = EXCHANGE_COMPONENTS[buyStage]

    return (
      <Modal className='fullscreen' onClose={this.onClose} width={isBrowser ? 500 : undefined}>
        {ExchangeComponent({...this.props,
          next: this.next,
          back: this.back})}
      </Modal>
    )
  }
}

ExchangeModal.defaultProps = {
  buyStage: 1
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  marketMakerActions: bindActionCreators(marketMakerActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: getSelectedCommunity(state),
  ccBalance: getSelectedCommunityBalance(state),
  clnBalance: getClnBalance(state)
})

const withData = withMaybe(props => !(props.community &&
   props.community.isMarketMakerLoaded && props.ccBalance && props.clnBalance))

export default connect(mapStateToProps, mapDispatchToProps)(withData(ExchangeModal))
