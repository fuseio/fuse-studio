import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'components/Modal'

const PriceExplanationModal = (props) => (
  <Modal className='fullscreen' onClose={props.hideModal}>
    <div className='transaction-in-progress legal-explanation'>
      <div className='summary-prices-wrapper'>
        <p>The calculation of the estimated denomination of the {props.token.name} in USD is based on:</p>
        <p>
          (a) The price of {props.token.name} in CLN as determined by the Market Maker Smart Contract;
        </p>
        <p>
          (b) The conversion rate of CLN to Ether to USD, according to <a target='_blank' href='https://coinmarketcap.com/currencies/colu-local-network/'>CoinMarketCap</a>
        </p>
        <p>
          Currently, conversion of {props.token.name}s to CLN/Fiat is not accessible to the general public. Furthermore, Colu does not represent that the estimated denomination of the {props.token.name}s is the market value for {props.token.name}s, or that they carry any value at all.
        </p>
      </div>
    </div>
  </Modal>
)

PriceExplanationModal.propTypes = {
  token: PropTypes.object.isRequired
}

export default PriceExplanationModal
