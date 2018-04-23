import React, {Component} from 'react'
import { connect } from 'react-redux'

import { name, symbol, totalSupply, balanceOf, transfer, owner } from 'actions/basicToken'
import { openMarket } from 'actions/currencyFactory'

const styles = {
  contract: {
    border: '2px solid blue',
    borderRadius: 10,
    margin: 10,
    padding: 10
  }
}

class BasicTokenContract extends Component {
  state = {
    to: '0x28eF70800b19B3bf15bF8210f351a95F15613aeb',
    value: 1000
  }

  componentDidMount () {
    // this.props.name(this.props.address)
    // this.props.symbol(this.props.address)
    // this.props.totalSupply(this.props.address)
    // this.props.balanceOf(this.props.address, '0x0d4DF041Dbef6fFC0E444a4a213774AdB0c118C2')
    // this.props.owner(this.props.address)
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.address !== this.props.address) {
      // this.props.name(nextProps.address)
      // this.props.symbol(nextProps.address)
      // this.props.totalSupply(nextProps.address)
      // this.props.balanceOf(nextProps.address, '0x0d4DF041Dbef6fFC0E444a4a213774AdB0c118C2')
      // this.props.owner(nextProps.address)
    }
  }

  handleTransfer = () => this.props.transfer(this.props.address, this.state.to, this.state.value)

  handleOpenMarket = () => this.props.openMarket(this.props.address)

  handleToChange = (event) => {
    this.setState({to: event.target.value})
  }

  handleValueChange = (event) => {
    this.setState({value: event.target.value})
  }

  render () {
    if (!this.props.contract) {
      return <div>Loading</div>
    }
    return <div style={styles.contract}>
      <div>Contract Name: {this.props.contractName}</div>
      <div>Name: {this.props.contract.name} </div>
      <div>Symbol: {this.props.contract.symbol} </div>
      <div>Owner: {this.props.contract.owner} </div>
      <div>Total Supply: {this.props.contract.totalSupply} </div>
      <div>balanceOf: {this.props.contract.balanceOf} </div>
      <div>
        to: <input type='text' value={this.state.to} onChange={this.handleToChange} />
        value: <input type='text' value={this.state.value} onChange={this.handleValueChange} />
        <button onClick={this.handleTransfer}>transfer</button>
      </div>
      <button onClick={this.handleOpenMarket}>open market</button>
    </div>
  }
}

const mapStateToProps = (state) => ({})

export default connect(
  mapStateToProps, {
    name,
    symbol,
    totalSupply,
    balanceOf,
    transfer,
    openMarket,
    owner
  }
)(BasicTokenContract)
