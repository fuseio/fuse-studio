import React from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'

const NameStep = ({ communityName, handleChangeCommunityName, setNextStep }) => {
  return (
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
      <div>
        <button
          className='button button--normal'
          disabled={communityName.length < 3}
          onClick={setNextStep}
        >
          NEXT<FontAwesome name='arrow-right' />
        </button>
      </div>
    </div>
  )
}

export default NameStep
