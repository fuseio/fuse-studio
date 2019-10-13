import React, { PureComponent } from 'react'
import TextInput from 'components/common/TextInput'

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
    const { communityType, existingToken } = this.props
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
            defaultValue={communityType && communityType.value !== 'existingToken' ? this.state.customSymbol : existingToken.symbol}
            onChange={this.handleChangeCustomSymbol}
          />
        </div>
      </div>
    )
  }
}
