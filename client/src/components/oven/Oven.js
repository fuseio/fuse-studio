import React, {Component} from 'react'
import CommunitiesList from 'components/oven/CommunitiesList'
import { connect } from 'react-redux'
import {fetchCommunities, fetchCommunitiesByOwner} from 'actions/communities'
import {loadModal} from 'actions/ui'
import {openMarket} from 'actions/marketMaker'
import {getAccountAddress} from 'selectors/accounts'

class Oven extends Component {
  componentDidUpdate (prevProps) {
    if (this.props.account && !prevProps.account) {
      this.props.fetchCommunitiesByOwner(this.props.account)
    }
  }

  render = () => <CommunitiesList {...this.props} />
}

const mapStateToProps = state => ({
  tokens: state.tokens,
  marketMaker: state.marketMaker,
  fiat: state.fiat,
  ...state.screens.oven,
  account: getAccountAddress(state)
})

const mapDispatchToProps = {
  fetchCommunities,
  fetchCommunitiesByOwner,
  openMarket,
  loadModal
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Oven)
