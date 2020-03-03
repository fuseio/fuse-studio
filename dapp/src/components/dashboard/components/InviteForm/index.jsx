import React, { Component, Fragment } from 'react'
import { Formik, Field } from 'formik'
import { connect } from 'react-redux'
import inviteShape from 'utils/validation/shapes/invite'
import TextInput from 'components/common/TextInput'
// import PhoneInput from 'react-phone-input-2'
import { inviteUserToCommunity } from 'actions/community'

class Invite extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      invitationType: 'sms',
      email: '',
      phoneNumber: ''
    }

    this.validationSchema = inviteShape
  }

  onSubmit = (values, formikBag) => {
    const { inviteUserToCommunity, communityAddress } = this.props
    inviteUserToCommunity(communityAddress, values)
  }

  renderForm = ({ values, handleSubmit, errors, isValid, touched, isSubmitting }) => {
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
                  <Fragment>
                    <input {...field} type='radio' value='sms' checked={isSMS} onChange={() => setFieldValue('invitationType', 'sms')} className='hidden' id='input1' />
                    <label className='entry' htmlFor='input1'>
                      <div className='circle' />
                      <div className='entry-label'>Text message (SMS)</div>
                    </label>
                  </Fragment>
                )}
              />
              <Field
                name='invitationType'
                render={({ field, form: { setFieldValue } }) => (
                  <Fragment>
                    <input {...field} type='radio' checked={isEMAIL} onChange={() => setFieldValue('invitationType', 'email')} value='email' className='hidden' id='input2' />
                    <label className='entry' htmlFor='input2'>
                      <div className='circle' />
                      <div className='entry-label'>Email</div>
                    </label>
                  </Fragment>
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
                <Field
                  name='email'
                  render={({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      type='email'
                      placeholder='Insert email'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                />
              )
            }
            {
              isSMS && (
                <Field
                  name='phoneNumber'
                  render={({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      placeholder='e.g +972525555555'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                />
              )
            }
            <button className='button button--normal' disabled={!isValid}>Send</button>
            {isSubmitting && <div className='invite__resend'>
              Invitation sent.
              <br />
              *Didn't get any message? Resend message
            </div>}
          </div>

        </div>
      </form>
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={this.onSubmit}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        validateOnChange
      />
    )
  }
}

export default connect(null, {
  inviteUserToCommunity
})(Invite)
