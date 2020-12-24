import React, { Fragment } from 'react'
import { Formik, Field } from 'formik'
import inviteShape from 'utils/validation/shapes/invite'
import TextInput from 'components/common/TextInput'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

const Invite = () => {
  const { dashboard } = useStore()
  const onSubmit = (values) => {
    dashboard.inviteUserToCommunity(values)
  }

  const renderForm = ({ values, handleSubmit, isValid, isSubmitting }) => {
    const { invitationType } = values
    const isSMS = invitationType === 'sms'
    const isEMAIL = invitationType === 'email'
    return (
      <form onSubmit={handleSubmit} className='invite'>
        <div className='invite__wrapper'>
          <div className='invite__title'>Get a smart invite link to your phone</div>
          <div className='invite__containerOuter'>
            <div className='containerInner'>
              <Field
                name='invitationType'
                render={({ field, form: { setFieldValue } }) => (
                  <>
                    <input {...field} type='radio' value='sms' checked={isSMS} onChange={() => setFieldValue('invitationType', 'sms')} className='hidden' id='input1' />
                    <label className='entry' htmlFor='input1'>
                      <div className='circle' />
                      <div className='entry-label'>Text message (SMS)</div>
                    </label>
                  </>
                )}
              />
              <Field
                name='invitationType'
                render={({ field, form: { setFieldValue } }) => (
                  <>
                    <input {...field} type='radio' checked={isEMAIL} onChange={() => setFieldValue('invitationType', 'email')} value='email' className='hidden' id='input2' />
                    <label className='entry' htmlFor='input2'>
                      <div className='circle' />
                      <div className='entry-label'>Email</div>
                    </label>
                  </>
                )}
              />
              <div className='highlight' />
              <div className='overlay' />
            </div>
          </div>
          <div className='grid-y'>
            <div className='invite__text cell'>
              This will send a special link that will automatically switch to your community
            </div>
            {
              isEMAIL && (
                <Field name='email'>
                  {({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      type='email'
                      placeholder='Insert email'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                </Field>
              )
            }
            {
              isSMS && (
                <Field name='phoneNumber'>
                  {({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      placeholder='e.g +972525555555'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                </Field>
              )
            }
            <button className='button button--normal' disabled={!isValid}>Send</button>
            {
              isSubmitting &&
                <div className='invite__resend'>
                  Invitation sent.
                  <br />
                  *Didn't get any message? Resend message
                </div>
            }
          </div>

        </div>
      </form>
    )
  }

  return (
    <Formik
      initialValues={{
        invitationType: 'sms',
        email: '',
        phoneNumber: ''
      }}
      onSubmit={onSubmit}
      validationSchema={inviteShape}
      render={renderForm}
      validateOnChange
    />
  )
}

export default observer(Invite)
