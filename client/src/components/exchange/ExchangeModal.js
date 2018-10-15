import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import Modal from 'components/Modal'
import BuySellAmounts from 'components/exchange/BuySellAmounts'
import Summary from 'components/exchange/Summary'
import Pending from 'components/exchange/Pending'
import Completed from 'components/exchange/Completed'
import {getSelectedCommunity} from 'selectors/communities'
import {getSelectedCommunityBalance, getClnBalance} from 'selectors/accounts'
import {withNeither} from 'utils/components'
import { isBrowser } from 'react-device-detect'
import LoadingModal from 'components/LoadingModal'
import ComingSoonModal from 'components/ComingSoonModal'
import compose from 'lodash/flowRight'

const EXCHANGE_COMPONENTS = {
  1: (props) => <BuySellAmounts {...props} />,
  2: (props) => <Summary {...props} />,
  3: (props) => <Pending {...props} />,
  4: (props) => <Completed {...props} />
}

class ExchangeModal extends React.Component {
  next = (props) => this.props.uiActions.updateModalProps({
    buyStage: this.props.buyStage + 1
  })

  back = () => this.props.uiActions.updateModalProps({
    buyStage: this.props.buyStage - 1
  })

  render () {
    const { buyStage } = this.props
    const ExchangeComponent = EXCHANGE_COMPONENTS[buyStage]

    return (
      <Modal className='fullscreen' onClose={this.props.hideModal} width={isBrowser ? 500 : undefined}>
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

const isLoadedConditionFn = props => props.community &&
   props.community.isMarketMakerLoaded && props.ccBalance && props.clnBalance

const isOpenForPublicConditionFn = props => props.community.isOpenForPublic

const withConditionalRenderings = compose(
  withNeither(isLoadedConditionFn, LoadingModal),
  withNeither(isOpenForPublicConditionFn, ComingSoonModal)
)

const ExchangeModalWithConditionalRenderings = withConditionalRenderings(ExchangeModal)
export default connect(mapStateToProps, mapDispatchToProps)(ExchangeModalWithConditionalRenderings)
