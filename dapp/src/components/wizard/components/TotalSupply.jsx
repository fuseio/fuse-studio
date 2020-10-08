import React, { Fragment } from 'react'
import TextInput from 'components/common/TextInput'
import { getIn, Field, ErrorMessage, useFormikContext } from 'formik'

const TotalSupply = () => {
  const formik = useFormikContext()
  const communityTypeValue = getIn(formik.values, 'communityType')
  return (
    <Fragment>
      <div className='attributes__attribute attributes__attribute--supply'>
        <h3 className='attributes__title'>
          {communityTypeValue && communityTypeValue.value === 'mintableBurnable' ? 'Initial Supply' : 'Total Supply'}
        </h3>
        <Field
          name='totalSupply'
        >
          {({ field, form: { handleChange } }) => (
            <div className='attributes__supply'>
              <TextInput
                {...field}
                className='attributes__supply__input'
                type='number'
                placeholder='...'
                autoComplete='off'
                onChange={handleChange}
              />
            </div>
          )}
        </Field>
        <ErrorMessage name='totalSupply' render={msg => <div className='input-error'>{msg}</div>} />
      </div>
    </Fragment>
  )
}

export default TotalSupply
