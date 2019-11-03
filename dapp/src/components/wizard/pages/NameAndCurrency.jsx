import React from 'react'
import CurrencyType from '../components/CurrencyType'
// import { isMobileOnly } from 'react-device-detect'
import TextField from '@material-ui/core/TextField'
import { Field } from 'formik'
import { nameToSymbol } from 'utils/format'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'

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
                if (window && window.analytics) {
                  window.analytics.track('Filling community name')
                }
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
      <CurrencyType
        networkType={networkType}
      />
      <div className='name' style={{ padding: '0' }}>
        <h3 className='name__title' style={{ paddingBottom: '.2em' }}>Email <FontAwesome data-tip style={{ fontSize: '0.750em' }} data-for='email' name='info-circle' /></h3>
        <ReactTooltip className='tooltip__content' id='email' place='bottom' effect='solid'>
          <div>We collect your email only to send you important notifications about your community and for a friendlier experience with future collaborators.</div>
        </ReactTooltip>
        <p className='name__text' style={{ marginBottom: '1em' }}>Leave us your mail and we will notify you with all the essential information</p>
        <Field
          name='email'
          render={({ field, form: { handleChange } }) => (
            <TextField
              {...field}
              onChange={event => {
                if (window && window.analytics) {
                  window.analytics.track('Filling email')
                }
                handleChange(event)
              }}
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
      {/* {isMobileOnly && <div className='line' ><hr /></div>} */}
    </div>
  )
}

export default NameAndCurrency
