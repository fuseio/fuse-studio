import React from 'react'
import CurrencyType from './CurrencyType'
import { isMobileOnly } from 'react-device-detect'
import TextField from '@material-ui/core/TextField'
import isEmpty from 'lodash/isEmpty'

const NameCurrencyStep = ({ existingToken, setExistingToken, communityName, handleChangeCommunityName, setNextStep, setCommunityType, communityType, networkType }) => {
  const validateStep = () => {
    return (
      (isEmpty(communityName) || communityName.length < 3) ||
      (isEmpty(communityType)) ||
      (communityType && communityType.value === 'existingToken' && isEmpty(existingToken))
    )
  }

  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h3 className='name__title'>Name your community</h3>
        <TextField
          onChange={handleChangeCommunityName}
          type='search'
          placeholder='Name your community'
          classes={{
            root: 'name__field'
          }}
          inputProps={{
            maxLength: '36',
            autoComplete: 'off'
          }}
          InputProps={{
            classes: {
              underline: 'name__field--underline',
              error: 'name__field--error'
            }
          }}
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
          className='button button--normal'
          disabled={validateStep()}
          onClick={setNextStep}
        >Next
        </button>
      </div>
    </div>
  )
}

export default NameCurrencyStep
