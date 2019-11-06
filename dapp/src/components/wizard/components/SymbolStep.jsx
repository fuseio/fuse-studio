import React from 'react'
import TextInput from 'components/common/TextInput'
import { connect, getIn, Field } from 'formik'

const SymbolStep = ({ formik }) => {
  const communityType = getIn(formik.values, 'communityType')
  const communitySymbol = getIn(formik.values, 'communitySymbol')
  const existingToken = getIn(formik.values, 'existingToken')
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
              disabled={!communityType}
              defaultValue={communityType ? communitySymbol : existingToken.symbol}
              onChange={(event) => {
                setFieldValue('communitySymbol', event.target.value)
                if (window && window.analytics) {
                  window.analytics.track('Filling symbol')
                }
              }}
            />
          )}
        />
      </div>
    </div>
  )
}

export default connect(SymbolStep)
