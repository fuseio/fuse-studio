import React, {Component} from 'react'
import {connect} from 'react-redux'
import { BigNumber } from 'bignumber.js'

import * as actions from 'actions/communities'

class IssuanceFactory extends Component {
  componentDidMount () {
    // setTimeout(() => this.createCurrency(), 1000)
  }

  createCurrency = () => {
    const currencyData = {
      name: 'TestIssuanceCoin',
      symbol: 'TIC',
      decimals: 18,
      totalSupply: new BigNumber(1e24)
    }
    const communityMetadata =
      {'location':
         {'geo': {'lat': '32.0853', 'lng': '34.7818'}, 'name': 'TLV - JAFFA'},
      'image': 'ipfs://QmPKbrwmzCRZVTsUSe4xKujCKcuMN1NLVi2wNXWNUxqU4L',
      'description': 'TLV - The TLV Coin is the official CLN community coin of Tel Aviv, Israel.',
      'website': 'https : //www.colu.com/community/tel-aviv',
      'social': {'facebook': 'https://www.facebook.com/ColuTelAviv/',
        'instagram': 'https://www.instagram.com/colu_telaviv/'}
      }
    this.props.issueCommunity(communityMetadata, currencyData)
  }

  render = () => (
    <div>Issue</div>
  )
}

export default connect(null, actions)(IssuanceFactory)
