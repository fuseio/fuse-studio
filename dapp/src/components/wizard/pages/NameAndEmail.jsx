import React from 'react'
import TextField from '@material-ui/core/TextField'
import { connect, Field } from 'formik'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'

const NameAndCurrency = ({
  formik
}) => {
  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h3 className='name__title'>Name your economy</h3>
        <Field
          name='communityName'
          render={({ field }) => (
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
        />
      </div>
      <div className='name' style={{ padding: '0 0 60px' }}>
        <h3 className='name__title'>Add economy description</h3>
        <Field
          name='description'
          render={({ field }) => (
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
          )} />
      </div>
      <div className='name' style={{ padding: '0' }}>
        <h3 className='name__title' style={{ paddingBottom: '.2em' }}>Email <FontAwesome data-tip style={{ fontSize: '0.750em' }} data-for='email' name='info-circle' /></h3>
        <ReactTooltip className='tooltip__content' id='email' place='bottom' effect='solid'>
          <div>We collect your email only to send you important notifications about your economy and for a friendlier experience with future collaborators.</div>
        </ReactTooltip>
        <p className='name__text' style={{ marginBottom: '1em' }}>Leave us your mail and we will notify you with all the essential information</p>
        <Field
          name='email'
          render={({ field }) => (
            <TextField
              {...field}
              type='email'
              placeholder='Insert mail'
              classes={{
                root: 'name__field'
              }}
              inputProps={{
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
        <div className='name__toggle'>
          <Field
            name='subscribe'
            render={({ field }) => (
              <label className='toggle'>
                <input
                  {...field}
                  checked={field.value}
                  type='checkbox'
                />
                <div className='toggle__handler'>
                  <span className='toggle__handler__indicator' />
                </div>
              </label>
            )}
          />
          <div className='name__toggle__text'>
            <span>I want to receive updates from Fuse.io</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect(NameAndCurrency)
