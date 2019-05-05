import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'
import PropTypes from 'prop-types'

export default class SymbolStep extends Component {
  constructor (props) {
    super(props)
    this.state = {
      customSymbol: props.communitySymbol
    }
  }

  handleChangeCustomSymbol = (event) => {
    const customSymbol = event.target.value.substr(0, 4)
    this.setState({ customSymbol })
  }

  setNextStep = () => {
    this.props.handleChangeCommunitySymbol(this.state.customSymbol)
    this.props.setNextStep()
  }

  render () {
    return (
      <div className='symbol'>
        <h2 className='symbol__title'>Currency Symbol</h2>
        <h2 className='symbol__title symbol__title--name'>{this.props.communityName}</h2>
        <div className='symbol__field'>
          <TextInput
            id='communitySymbol'
            type='text'
            autoFocus
            autoComplete='off'
            maxLength='4'
            minLength='2'
            defaultValue={this.state.customSymbol}
            onChange={this.handleChangeCustomSymbol}
          />
        </div>
        <button
          className='button button--big'
          disabled={this.props.communitySymbol.length < 2 || this.state.customSymbol.length < 2}
          onClick={this.setNextStep}
        >
          NEXT<FontAwesome name='angle-right' className='symbol-icon' />
        </button>
      </div>
    )
  }
}

SymbolStep.propTypes = {
  communityName: PropTypes.string,
  setNextStep: PropTypes.func.isRequired,
  communitySymbol: PropTypes.string,
  handleChangeCommunitySymbol: PropTypes.func.isRequired
}
