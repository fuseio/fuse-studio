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
      inventionType: 'email',
      email: '',
      phoneNumber: ''
    }

    this.validationSchema = inviteShape
  }

  onSubmit = (values) => {
    const { inviteUserToCommunity, communityAddress } = this.props
    console.log({ values, communityAddress })
    inviteUserToCommunity(communityAddress, values)
  }

  renderForm = ({ values, handleSubmit, errors, isValid, touched }) => {
    const { inventionType } = values
    const isSMS = inventionType === 'sms'
    const isEMAIL = inventionType === 'email'
    return (
      <form onSubmit={handleSubmit} className='invite'>
        <div className='invite__wrapper'>
          <div className='invite__title'>Invite a friend</div>
          <div className='invite__containerOuter'>
            <div className='containerInner'>
              <Field
                name='inventionType'
                render={({ field, form: { setFieldValue } }) => (
                  <Fragment>
                    <input {...field} type='radio' value='sms' checked={isSMS} onChange={() => setFieldValue('inventionType', 'sms')} className='hidden' id='input1' />
                    <label className='entry' for='input1'>
                      <div className='circle' />
                      <div className='entry-label'>Text message (SMS)</div>
                    </label>
                  </Fragment>
                )}
              />
              <Field
                name='inventionType'
                render={({ field, form: { setFieldValue } }) => (
                  <Fragment>
                    <input {...field} type='radio' checked={isEMAIL} onChange={() => setFieldValue('inventionType', 'email')} value='email' className='hidden' id='input2' />
                    <label className='entry' for='input2'>
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
              {isEMAIL && `We will send an Email with instructions on how to join community`}
              {isSMS && `We will send an SMS message with instructions on how to join community`}
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
            <button className='button button--normal' disabled={!isValid}>Save</button>
            {/* <div className='invite__resend'>*Didn't get any message? Resend message</div> */}
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
        isInitialValid={false}
      />
    )
  }
}

export default connect(null, {
  inviteUserToCommunity
})(Invite)
