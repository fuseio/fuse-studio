import React from 'react'
import TextInput from 'components/common/TextInput'
import { connect, getIn, Field } from 'formik'

const SymbolStep = ({ formik }) => {
  const communityType = getIn(formik.values, 'communityType')
  const communitySymbol = getIn(formik.values, 'communitySymbol')
  return (
    <div className='symbol'>
      <h2 className='symbol__title'>Currency Symbol</h2>
      <div className='symbol__field'>
        <Field
          name='communitySymbol'
          render={({ field, form: { setFieldValue } }) => (
            <TextInput
              id='communitySymbol'
              type='text'
              autoComplete='off'
              maxLength='4'
              minLength='2'
              disabled={communityType && communityType.value === 'existingToken'}
              defaultValue={communityType && communityType.value !== 'existingToken' ? communitySymbol : 'DAI'}
              onChange={(event) => {
                setFieldValue('communitySymbol', event.target.value)
              }}
            />
          )}
        />
      </div>
    </div>
  )
}

export default connect(SymbolStep)
