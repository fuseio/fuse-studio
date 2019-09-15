import React from 'react'
import CurrencyType from '../components/CurrencyType'
import { isMobileOnly } from 'react-device-detect'
import TextField from '@material-ui/core/TextField'
// import isEmpty from 'lodash/isEmpty'
import { Field } from 'formik'
import { nameToSymbol } from 'utils/format'

const NameAndCurrency = ({ networkType }) => {
  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h3 className='name__title'>Name your community</h3>
        <Field
          name='communityName'
          render={({ field, form: { setFieldValue, handleChange } }) => (
            <TextField
              {...field}
              onChange={event => {
                handleChange(event)
                setFieldValue('communitySymbol', nameToSymbol(event.target.value))
              }}
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
          )}
        />
      </div>
      {isMobileOnly && <div className='line' ><hr /></div>}
      <CurrencyType
        networkType={networkType}
      />
    </div>
  )
}

export default NameAndCurrency
