import React from 'react'
import CurrencyType from './CurrencyType'
import { isMobileOnly } from 'react-device-detect'
import TextField from '@material-ui/core/TextField'
import isEmpty from 'lodash/isEmpty'

const NameCurrencyStep = ({ subscribe, setSubscription, handleChangeEmail, existingToken, setExistingToken, communityName, handleChangeCommunityName, setNextStep, setCommunityType, communityType, networkType }) => {
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
      <div className='name' style={{ paddingTop: '0' }}>
        <h3 className='name__title' style={{ paddingBottom: '.2em' }}>Email</h3>
        <p className='name__text' style={{ marginBottom: '1em' }}>Leave us your mail and we will notify you with all the essential information</p>
        <TextField
          onChange={(event) => handleChangeEmail(event.target.value)}
          type='search'
          placeholder='Insert mail'
          classes={{
            root: 'name__field'
          }}
          inputProps={{
            autoComplete: 'off'
          }}
          InputProps={{
            classes: {
              underline: 'name__field--underline',
              error: 'name__field--error'
            }
          }}
        />
        <div className='name__toggle'>
          <label className='toggle'>
            <input
              type='checkbox'
              checked={subscribe}
              value={subscribe}
              onChange={event => setSubscription(event.target.checked)}
            />
            <div className='toggle__handler'>
              <span className='toggle__handler__indicator' />
            </div>
          </label>
          <div className='name__toggle__text'>
            <span>I want to receive updates from Fuse.io</span>
          </div>
        </div>
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
