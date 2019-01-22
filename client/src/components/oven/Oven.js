import React, {Component} from 'react'
import CommunitiesList from 'components/oven/CommunitiesList'
import { connect } from 'react-redux'
import {fetchTokens, fetchTokensByOwner} from 'actions/token'
import {loadModal} from 'actions/ui'
import {getAccountAddress} from 'selectors/accounts'
import TopNav from 'components/TopNav'

class Oven extends Component {
  componentDidUpdate (prevProps) {
    if (this.props.account && !prevProps.account) {
      this.props.fetchTokensByOwner(this.props.account)
    }
  }

  render = () => (
    <div>
      <TopNav
        active
        history={this.props.history}
      />
      <CommunitiesList {...this.props} />
    </div>
  )
}

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  ...state.screens.oven
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Oven)
