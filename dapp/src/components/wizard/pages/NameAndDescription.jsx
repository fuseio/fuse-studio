import React, { useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { Field, ErrorMessage, useFormikContext } from 'formik'
import { useSelector } from 'react-redux'
import { getAccount } from 'selectors/accounts'
import { formatWei } from 'utils/format'

const NameAndDescription = () => {
  const formik = useFormikContext()
  const account = useSelector(getAccount)

  useEffect(() => {
    const hasBalance = parseFloat(account && account.home ? formatWei((account.home), 2) : '0') > 0.01
    formik.setFieldValue('hasBalance', hasBalance)
  }, [account])

  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h3 className='name__title'>Name your economy</h3>
        <Field name='communityName'>
          {({ field }) => (
            <TextField
              {...field}
              type='search'
              placeholder='Name your economy'
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
        </Field>
        <ErrorMessage name='communityName' render={msg => <div className='input-error input-error--block'>{msg}</div>} />
      </div>
      <div className='name'>
        <h3 className='name__title'>Add economy description</h3>
        <Field name='description'>
          {({ field }) => (
            <TextField
              {...field}
              multiline
              placeholder='Add description'
              rows={4}
              variant='standard'
              classes={{
                root: 'name__textarea'
              }}
              fullWidth
              InputProps={{
                classes: {
                  underline: 'name__field--underline',
                  error: 'name__field--error'
                }
              }}
            />
          )}
        </Field>
        <ErrorMessage name='description' render={msg => <div className='input-error input-error--block'>{msg}</div>} />
      </div>
    </div>
  )
}

export default NameAndDescription
