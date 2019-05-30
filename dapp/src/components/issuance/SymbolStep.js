import React, { PureComponent } from 'react'
// import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'
// import PropTypes from 'prop-types'

export default class SymbolStep extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      customSymbol: props.communitySymbol
    }
  }

  handleChangeCustomSymbol = (event) => {
    const customSymbol = event.target.value.substr(0, 4)
    this.props.handleChangeCommunitySymbol(customSymbol)
  }

  render () {
    const { communityType } = this.props
    return (
      <div className='symbol'>
        <h2 className='symbol__title'>Currency Symbol</h2>
        <div className='symbol__field'>
          <TextInput
            id='communitySymbol'
            type='text'
            autoComplete='off'
            maxLength='4'
            minLength='2'
            disabled={communityType && communityType.value === 'existingToken'}
            defaultValue={communityType && communityType.value !== 'existingToken' ? this.state.customSymbol : 'DAI'}
            onChange={this.handleChangeCustomSymbol}
          />
        </div>
      </div>
    )
  }
}
