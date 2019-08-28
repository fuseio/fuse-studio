import React, { Fragment } from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/common/TextInput'
import { isMobileOnly } from 'react-device-detect'

const TotalSupply = ({ checkCondition, totalSupply, setTotalSupply, communityType, setNextStep }) => {
  return (
    <Fragment>
      <div className='attributes__attribute attributes__attribute--supply'>
        <h3 className='attributes__title'>
          {
            communityType && communityType.value === 'mintableBurnable' ? 'Initial Supply' : 'Total Supply'
          }
        </h3>
        <div className='attributes__supply'>
          <TextInput
            className='attributes__supply__input'
            type='number'
            placeholder='...'
            autoComplete='off'
            value={totalSupply}
            onKeyDown={(evt) => checkCondition(evt, (evt.key === 'e' || evt.key === '-'))}
            onChange={(event) => setTotalSupply(event.target.value)}
          />
        </div>
      </div>
      {isMobileOnly && <div className='grid-x align-center next'>
        <button
          className='button button--normal'
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
