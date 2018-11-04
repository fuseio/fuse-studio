import React from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from './../TextInput'

const NameStep = ({communityName, handleChangeCommunityName, setNextStep}) => {
  return (
    <div className='step-content-community'>
      <h2 className='step-content-title community-title'>Name your community</h2>
      <TextInput
        className='step-community-name'
        id='communityName'
        type='text'
        placeholder='Type your community name...'
        value={communityName}
        maxLength='30'
        onChange={handleChangeCommunityName}
      />
      <button
        className='next-button'
        disabled={communityName.length < 3}
        onClick={setNextStep}
      >
        <FontAwesome className='next-icon' name='arrow-right' />
      </button>
    </div>
  )
}

export default NameStep
