import React, { Fragment } from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'
import { isMobileOnly } from 'react-device-detect'

const TotalSupply = ({ checkCondition, totalSupply, setTotalSupply, communityType, setNextStep, communityLogo }) => {
  return (
    <Fragment>
      <div className='attributes__attribute'>
        <h3 className='attributes__title'>
          Initial \ Total Supply
        </h3>
        <div className='attributes__supply'>
          <TextInput
            className='attributes__supply__input'
            id='communityName'
            type='number'
            placeholder='21,000,000'
            autoComplete='off'
            value={totalSupply}
            onKeyDown={(evt) => checkCondition(evt, (evt.key === 'e' || evt.key === '-'))}
            onChange={(event) => setTotalSupply(event.target.value)}
          />
        </div>
      </div>
      {isMobileOnly && <div className='grid-x align-center attributes__next'>
        <button
          className='button button--big'
          disabled={
            totalSupply < 0 || totalSupply === '0' || !totalSupply
          }
          onClick={setNextStep}
        >
          NEXT
          <FontAwesome className='symbol-icon' name='angle-right' />
        </button>
      </div>}
    </Fragment>
  )
}

export default TotalSupply
