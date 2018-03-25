import React, {Component} from 'react'
import { connect } from 'react-redux'

import { transfer } from 'actions/basicToken'

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

  handleClick = () => {
    this.props.transfer(this.state.to, this.state.value)
  }

  handleToChange = (event) => {
    this.setState({to: event.target.value})
  }

  handleValueChange = (event) => {
    this.setState({value: event.target.value})
  }

  render () {
    return <div style={styles.contract}>
      <div>Contract Name: ColuLocalNetwork</div>
      <div>Token Name: {this.props.contract.name} </div>
      <div>balanceOf: {this.props.contract.balance} </div>
      <div>
        to: <input type='text' value={this.state.to} onChange={this.handleToChange} />
        value: <input type='text' value={this.state.value} onChange={this.handleValueChange} />
        <button onClick={this.handleClick}>transfer</button>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => ({contract: state.basicToken})

export default connect(
  mapStateToProps, {
    transfer
  }
)(BasicTokenContract)
