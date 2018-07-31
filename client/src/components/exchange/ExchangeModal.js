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
import {getSelectedCommunityBalance, getClnBalance} from 'selectors/accounts'
import withEither from 'containers/withEither'

const EXCHANGE_COMPONENTS = {
  1: (props) => <BuySellAmounts {...props} />,
  2: (props) => <SummaryBuy {...props} />,
  3: (props) => <OpenMetamask {...props} />,
  4: (props) => <Pending {...props} />,
  5: (props) => <Completed {...props} />
}

class ExchangeModal extends React.Component {
  onClose = () => this.props.uiActions.hideModal()

  render () {
    const { buyStage } = this.props
    const ExchangeComponent = EXCHANGE_COMPONENTS[buyStage]

    return (
      <Modal className='fullscreen' onClose={this.onClose} width='500px'>
        {ExchangeComponent(this.props)}
      </Modal>
    )
  }
}

ExchangeModal.defaultProps = {
  buyStage: 1
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: getSelectedCommunity(state),
  ccBalance: getSelectedCommunityBalance(state),
  clnBalance: getClnBalance(state)
})

const withCommunity = withEither(props => !(props.community && props.community.isMarketMakerLoaded),
  (props) => null)

export default connect(mapStateToProps, mapDispatchToProps)(withCommunity(ExchangeModal))
