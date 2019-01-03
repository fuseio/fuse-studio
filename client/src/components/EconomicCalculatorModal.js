import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'
import {connect} from 'react-redux'
import { Chart } from 'react-google-charts'
import Modal from 'components/Modal'
import Loader from 'components/Loader'
import {predictClnPrices} from 'actions/marketMaker'
import TextInput from 'components/elements/TextInput'
import CommunityLogo from 'components/elements/CommunityLogo'

const MONTHS_IN_YEAR = 12

class EconomicCalculatorModal extends Component {
  state = {
    initialClnReserve: 100,
    amountOfTransactions: 100,
    averageTransactionInUsd: 10,
    gainPercentage: 15
  }

  componentDidMount () {
    this.predictClnPrices()
  }

  renderChartData (prices) {
    const hAxis = ['Time', '', '', '3 Months', '', '', '6 Months', '', '', '9 Months', '', '', '1 Year']
    const data = prices.map((price, key) => ([
      hAxis[key], parseFloat(price.cln), parseFloat(price.usd)
    ]))
    data.unshift(['', 'CLN', 'USD'])
    return data
  }

  predictClnPrices = () => this.props.predictClnPrices(this.props.token.address, {
    initialClnReserve: parseInt(this.state.initialClnReserve),
    amountOfTransactions: parseInt(this.state.amountOfTransactions),
    averageTransactionInUsd: parseInt(this.state.averageTransactionInUsd),
    gainRatio: parseInt(this.state.gainPercentage) / 100,
    iterations: MONTHS_IN_YEAR,
    token: this.props.token
  })

  handleChangeInitialClnReserve = (event) => {
    this.setState({initialClnReserve: event.target.value})
  }

  handleChangeAmountOfTransactions = (event) => {
    this.setState({amountOfTransactions: event.target.value})
  }

  handleChangeAverageTransactionInUsd = (event) => {
    this.setState({averageTransactionInUsd: event.target.value})
  }

  handleChangeGainRatio = (event) => {
    this.setState({gainPercentage: event.target.value})
  }

  isChartReady = () => this.props.predictedPrices.length && this.props.tokenAddress === this.props.token.address

  render () {
    const coinStatusClassStyle = classNames({
      'coin-status': true,
      'coin-status-active': this.props.marketMaker.isOpenForPublic,
      'coin-status-close': !this.props.marketMaker.isOpenForPublic
    })
    const options = {
      chart: {
        title: { position: 'none' }
      },
      colors: ['#5fddbb', '#c095ff'],
      width: 550,
      height: 350,
      series: {
        0: {axis: 'CLN'},
        1: {axis: 'USD'}
      },
      legend: {position: 'none'}
    }

    return (
      <Modal className='calculator' onClose={this.props.hideModal}>
        <div className='metamask-popup-close' onClick={this.props.hideModal}>
          <FontAwesome name='times' />
        </div>
        <div className='calculator-sidebar'>
          <div className='calculator-header'>
            <div className='calculator-header-content'>
              <CommunityLogo token={this.props.token} />
              <div className='calculator-logo-content'>
                <h3 className='calculator-title'>{this.props.token.name}</h3>
                <div className={coinStatusClassStyle}>
                  <span className='coin-status-indicator' /> <span className='coin-status-text'>{this.props.marketMaker.isOpenForPublic ? 'open' : 'close'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className='calculator-sidebar-container'>
            <div className='calculator-sidebar-content'>
              <p className='calculator-sidebar-label'>
                Initial CLN input
              </p>
              <TextInput
                className='calculator-sidebar-input'
                id='initialClnReserve'
                type='number'
                value={this.state.initialClnReserve}
                onChange={this.handleChangeInitialClnReserve}
              />
            </div>
            <div className='calculator-sidebar-content'>
              <p className='calculator-sidebar-label'>
                Monthly Transactions
              </p>
              <TextInput
                className='calculator-sidebar-input'
                id='amountOfTransactions'
                type='number'
                value={this.state.amountOfTransactions}
                onChange={this.handleChangeAmountOfTransactions}
              />
            </div>
            <div className='calculator-sidebar-content'>
              <p className='calculator-sidebar-label'>
                USD Price Per transaction
              </p>
              <TextInput
                className='calculator-sidebar-input'
                id='averageTransactionInUsd'
                type='number'
                value={this.state.averageTransactionInUsd}
                onChange={this.handleChangeAverageTransactionInUsd}
              />
            </div>
            <div className='calculator-sidebar-content'>
              <p className='calculator-sidebar-label'>
                % from transaction
              </p>
              <TextInput
                className='calculator-sidebar-input'
                id='gainPercentage'
                type='number'
                value={this.state.gainPercentage}
                onChange={this.handleChangeGainRatio}
              />
            </div>
            <button
              className='calculator-sidebar-btn'
              disabled={
                !this.state.initialClnReserve || !this.state.amountOfTransactions ||
                !this.state.averageTransactionInUsd || !this.state.gainPercentage
              }
              onClick={this.predictClnPrices}
            >Calculate</button>
          </div>
        </div>
        <div className='calculator-chart'>
          <div className='calculator-chart-legend'>
            <div className='calculator-chart-legend-point point-cc'>
              CLN Value
            </div>
            <div className='calculator-chart-legend-point point-usd'>
              USD Value
            </div>
          </div>
          <div className='calculator-chart-content'>
            {this.isChartReady() ? <div>
              <div className='calculator-chart-point point-usd'>
                USD
              </div>
              <div className='calculator-chart-point point-cc'>
                CLN
              </div>
              <Chart
                className='calculator-graph'
                chartType='Line'
                data={this.renderChartData(this.props.predictedPrices)}
                options={options}
              />
            </div>
              : <Loader color='#3a3269' className='calculator-logo-img calculator-chart-loader' />
            }
          </div>
          <div className='calculator-chart-footer'>
            {this.props.wrapper !== 'summary' && <button className='btn-adding'>
              <FontAwesome name='plus' className='top-nav-issuance-plus' /> Add CLN
            </button>}
          </div>
        </div>
      </Modal>
    )
  }
}

EconomicCalculatorModal.defaultProps = {
  wrapper: 'wrapper'
}

EconomicCalculatorModal.propTypes = {
  token: PropTypes.object.isRequired,
  marketMaker: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  predictedPrices: state.screens.calculator.prices,
  tokenAddress: state.screens.calculator.tokenAddress
})

const mapDispatchToProps = {
  predictClnPrices
}

export default connect(mapStateToProps, mapDispatchToProps)(EconomicCalculatorModal)
