import React from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'
import CurrencyType from './CurrencyType'
import { isMobileOnly } from 'react-device-detect'

const NameCurrencyStep = ({ setExistingToken, communityName, handleChangeCommunityName, setNextStep, setCommunityType, communityType, networkType }) => {
  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h2 className='name__title'>Name your community</h2>
        <TextInput
          className='name__field'
          id='communityName'
          type='text'
          autoComplete='off'
          placeholder='Type your community name...'
          value={communityName}
          maxLength='30'
          onChange={handleChangeCommunityName}
        />
      </div>
      {isMobileOnly && <div className='line' ><hr /></div>}
      <CurrencyType setExistingToken={setExistingToken} setCommunityType={setCommunityType} communityType={communityType} networkType={networkType} />
      <div className='name__next'>
        <button
          className='button button--normal'
          disabled={communityName.length < 3 || (communityType && !communityType.text)}
          onClick={setNextStep}
        >
          NEXT<FontAwesome name='arrow-right' />
        </button>
      </div>
    </div>
  )
}

export default NameCurrencyStep
