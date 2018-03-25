import React, {Component} from 'react'
import { connect } from 'react-redux'

import { supportsToken, tokens } from 'actions/currencyFactory'

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

  handleClick = () => this.props.supportsToken(this.state.address)

  state = {
    address: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
    tokenIndex: 0
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
    </div>
  }
}

const mapStateToProps = (state) => ({contract: state.currencyFactory})

export default connect(
  mapStateToProps, {
    supportsToken,
    tokens
  }
)(CurrencyFactoryContract)
