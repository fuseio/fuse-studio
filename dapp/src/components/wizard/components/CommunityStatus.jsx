import React from 'react'
import { getIn, Field, useFormikContext } from 'formik'

const CommunityStatus = () => {
  const formik = useFormikContext()
  const isOpen = getIn(formik.values, 'isOpen')
  return (
    <div className='close_open_community'>
      <h3 className='close_open_community__title'>
        Community status
      </h3>
      <Field name='isOpen'>
        {({ field, form: { setFieldValue } }) => (
          <label className='toggle'>
            <input
              type='checkbox'
              checked={isOpen}
              onChange={e => {
                setFieldValue('isOpen', e.target.checked)
                e.preventDefault()
                if (window && window.analytics) {
                  window.analytics.track(`Community status - ${e.target.checked ? 'open' : 'close'}`)
                }
              }}
              {...field}
            />
            <div className='toggle-wrapper'>
              <span className='toggle' />
            </div>
            <div className='close_open_community__text'>
              <span>{isOpen ? 'Open' : 'Close'} community:</span>
              {isOpen
                ? <span>&nbsp;Any user can join the community</span>
                : <span>&nbsp;Users can add themselves but need to approve them</span>
              }
            </div>
          </label>
        )}
      </Field>
    </div>
  )
}

export default CommunityStatus
