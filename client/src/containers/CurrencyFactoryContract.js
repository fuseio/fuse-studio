import React, {Component} from 'react'
import { connect } from 'react-redux'

import IPFSStorage from 'components/IPFSStorage'
import ContractStorage from 'components/ContractStorage'
import { supportsToken, tokens, createCurrency, insertCLNtoMarketMaker } from 'actions/currencyFactory'
import { setTokenURI } from 'actions/basicToken'

const styles = {
  contract: {
    border: '2px solid red',
    borderRadius: 10,
    margin: 10,
    padding: 10
  }
}

class CurrencyFactoryContract extends Component {
  componentDidMount () {
    this.props.tokens(0)
  }

  handleAddressChange = (event) => {
    this.setState({address: event.target.value})
  }

  handleTokenIndexChange = (event) => {
    this.setState({tokenIndex: event.target.value})
  }

  handleQueryTokens = (event) => {
    this.props.tokens(this.state.tokenIndex)
  }

  handleCreateCurrency = (event) => this.props.createCurrency(this.state.currency)

  handleClick = () => this.props.supportsToken(this.state.address)

  handleNameChange = (event) => this.setState({currency: {...this.state.currency, name: event.target.value}})

  handleSymbolChange = (event) => this.setState({currency: {...this.state.currency, symbol: event.target.value}})

  handleDecimalsChange = (event) => this.setState({currency: {...this.state.currency, decimals: event.target.value}})

  handleSupplyChange = (event) => this.setState({currency: {...this.state.currency, totalSupply: event.target.value}})

  handleTokenURIChange = (event) => this.setState({currency: {...this.state.currency, tokenURI: event.target.value}})

  state = {
    address: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
    tokenIndex: 0,
    currency: {
      name: 'CoolCoin',
      symbol: 'CC',
      decimals: 18,
      totalSupply: 1e+24,
      tokenURI: ''
    }
  }

  render () {
    return <div style={styles.contract}>
      <div>Contract Name: CurrencyFactory</div>
      <div>
        address: <input type='text' value={this.state.address} onChange={this.handleAddressChange} />
        <button onClick={this.handleClick}>supportsToken</button>
        result: {this.props.contract.supportsToken ? 'yes' : 'no'}
      </div>
      <div>
        tokens: <input type='text' value={this.state.tokenIndex} onChange={this.handleTokenIndexChange} />
        <button onClick={this.handleQueryTokens}>Query</button>
        result: {this.props.contract.tokens}
      </div>
      <br />
      <div>
        <span>Create CC</span>
        <div>
          name: <input type='text' value={this.state.currency.name} onChange={this.handleNameChange} />
        </div>
        <div>
          symbol: <input type='text' value={this.state.currency.symbol} onChange={this.handleSymbolChange} />
        </div>
        <div>
          decimals: <input type='number' value={this.state.currency.decimals} onChange={this.handleDecimalsChange} />
        </div>
        <div>
          totalSupply: <input type='number' value={this.state.currency.totalSupply} onChange={this.handleSupplyChange} />
        </div>
        <div>
          tokenURI: <input type='string' value={this.state.currency.tokenURI} onChange={this.handleTokenURIChange} />
        </div>
        <button onClick={this.handleCreateCurrency}>create CC</button>
      </div>
      <IPFSStorage />
      <ContractStorage insertCLNtoMarketMaker={this.props.insertCLNtoMarketMaker} setTokenURI={this.props.setTokenURI} />
    </div>
  }
}

const mapStateToProps = (state) => ({contract: state.currencyFactory})

export default connect(
  mapStateToProps, {
    supportsToken,
    tokens,
    createCurrency,
    setTokenURI,
    insertCLNtoMarketMaker
  }
)(CurrencyFactoryContract)
