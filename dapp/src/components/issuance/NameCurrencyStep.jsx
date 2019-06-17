import React from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/common/TextInput'
import CurrencyType from './CurrencyType'
import { isMobileOnly } from 'react-device-detect'

const NameCurrencyStep = ({ existingToken, setExistingToken, communityName, handleChangeCommunityName, setNextStep, setCommunityType, communityType, networkType }) => {
  const validateStep = () => {
    return (communityName && communityName.length < 3) ||
    (communityType && !communityType.text) ||
    (communityType && communityType.value === 'existingToken' && existingToken && !existingToken.value)
  }

  return (
    <div className='name__wrapper'>
      <div className='name'>
        <TextInput
          className='name__field'
          id='communityName'
          type='text'
          autoComplete='off'
          placeholder='Name your community'
          value={communityName}
          maxLength='30'
          onChange={handleChangeCommunityName}
        />
      </div>
      {isMobileOnly && <div className='line' ><hr /></div>}
      <CurrencyType
        existingToken={existingToken}
        setExistingToken={setExistingToken}
        setCommunityType={setCommunityType}
        communityType={communityType}
        networkType={networkType}
      />
      <div className='next'>
        <button
          className='button button--fuse button--normal'
          disabled={validateStep()}
          onClick={setNextStep}
        >
          NEXT<FontAwesome name='angle-right' />
        </button>
      </div>
    </div>
  )
}

export default NameCurrencyStep
