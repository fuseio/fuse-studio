import React from 'react'
import TextInput from 'components/common/TextInput'
import { getIn, Field, useFormikContext } from 'formik'

const CurrencySymbol = () => {
  const formik = useFormikContext()
  const communityType = getIn(formik.values, 'communityType')

  return (
    <div className='symbol'>
      <h2 className='symbol__title'>Currency Symbol</h2>
      <div className='symbol__field'>
        <Field name='communitySymbol'>
          {({ field, form: { setFieldValue } }) => (
            <TextInput
              {...field}
              id='communitySymbol'
              type='text'
              autoComplete='off'
              maxLength='4'
              minLength='2'
              disabled={!communityType}
              onChange={(event) => {
                setFieldValue('', event.target.value)
              }}
            />
          )}
        </Field>
      </div>
    </div>
  )
}

export default CurrencySymbol
