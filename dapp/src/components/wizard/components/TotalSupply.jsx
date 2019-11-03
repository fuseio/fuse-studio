import React, { Fragment } from 'react'
import TextInput from 'components/common/TextInput'
import { connect, getIn, Field } from 'formik'

const TotalSupply = ({ formik }) => {
  const communityTypeValue = getIn(formik.values, 'communityType')
  return (
    <Fragment>
      <div className='attributes__attribute attributes__attribute--supply'>
        <h3 className='attributes__title'>
          {communityTypeValue && communityTypeValue.value === 'mintableBurnable' ? 'Initial Supply' : 'Total Supply'}
        </h3>
        <Field
          name='totalSupply'
          render={({ field, form: { handleChange } }) => (
            <div className='attributes__supply'>
              <TextInput
                {...field}
                className='attributes__supply__input'
                type='number'
                placeholder='...'
                autoComplete='off'
                onChange={event => {
                  handleChange(event)
                  if (window && window.analytics) {
                    window.analytics.track('Filling total supply')
                  }
                }}
              />
            </div>
          )}
        />
      </div>
    </Fragment>
  )
}

export default connect(TotalSupply)
