import React from 'react'
import TextField from '@material-ui/core/TextField'
import { Field, ErrorMessage } from 'formik'

const NameAndDescription = () => {
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
      <div className='name' style={{ padding: '0' }}>
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
