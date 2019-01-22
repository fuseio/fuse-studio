import React from 'react'
import { withFormik } from 'formik'
import Yup from 'yup'
import FontAwesome from 'react-fontawesome'

import TextInput from 'components/elements/TextInput'
import Modal from 'components/Modal'
import {sendContactUs, subcribeToMailingList} from 'services/api/misc'
import ReactGA from 'services/ga'

const MyInnerForm = props => {
  const {
    values,
    touched,
    errors,
    isValid,
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    status
  } = props

  const handleClose = () => {
    ReactGA.event({
      category: 'Contact us',
      action: 'Click',
      label: 'Close'
    })
    props.hideModal()
  }

  return (
    <Modal className='contact-form' onClose={handleClose}>
      <h4>CONTACT US</h4>
      <div className='metamask-popup-close' onClick={handleClose}>
        <FontAwesome name='times' />
      </div>
      <div className='contact-container'>
        <form onSubmit={handleSubmit}>
          <div className='contact-horizontal'>
            <TextInput
              id='fullName'
              type='text'
              label='FULL NAME *'
              placeholder='Enter your full name'
              error={touched.fullName && errors.fullName}
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextInput
              id='email'
              type='email'
              label='EMAIL *'
              placeholder='Enter your email'
              error={touched.email && errors.email}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextInput
              id='phone'
              type='phone'
              label='PHONE NUMBER'
              placeholder='Enter your phone number'
              error={touched.phone && errors.phone}
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextInput
              id='company'
              type='company'
              label='COMPANY / ORGANIZATION'
              placeholder='Enter your company'
              error={touched.company && errors.company}
              value={values.company}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <div className='contact-horizontal'>
            <TextInput
              id='subject'
              type='subject'
              label='SUBJECT *'
              fieldType='select'
              placeholder='Select'
              error={touched.subject && errors.subject}
              value={values.subject}
              setFieldValue={setFieldValue}
              onBlur={handleBlur}
            />
            <TextInput
              id='message'
              type='message'
              label='MESSAGE *'
              placeholder='Enter your message'
              fieldType='textarea'
              error={touched.message && errors.message}
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextInput
              id='signup'
              type='checkbox'
              label='SIGN UP FOR UPDATES'
              fieldType='checkbox'
              value={!!values.signup}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <button type='submit' disabled={!isValid}>
              Submit
            </button>
          </div>
        </form>
        <p className='success-message'>{status && status.success ? 'Thanks for getting in touch. We\'ll reach out to you shortly.' : null}</p>
      </div>
    </Modal>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({ fullName: '', email: '', phone: '', company: '', subject: '', message: '' }),
  validationSchema: Yup.object().shape({
    fullName: Yup.string()
      .min(2, 'C\'mon, your name is longer than that')
      .matches(/^[a-z ,.'-]+$/i, 'Invalid input')
      .required('Your name is required.'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required.'),
    phone: Yup.string()
      .matches(/^(?:\+\d{1,3}|0\d{1,3}|00\d{1,2})?(?:\s?\(\d+\))?(?:[-\/\s.]|\d)+$/i, 'Invalid phone number'), /* eslint-disable-line no-useless-escape */
    company: Yup.string()
      .matches(/^[a-z 0-9,.'-]+$/i, 'Invalid input'),
    subject: Yup.string()
      .required('Subject is required.'),
    message: Yup.string()
      .max(500, 'Your message is too long.')
      .required('Message is required.')
  }),
  handleSubmit: (values, { setSubmitting, setStatus, resetForm }) => {
    setSubmitting(false)
    sendContactUs(values)
    if (values.signup) {
      subcribeToMailingList({email: values.email})
      ReactGA.event({
        category: 'Contact us',
        action: 'Click',
        label: 'Sign up (checkbox)'
      })
    }
    resetForm()
    setStatus({ success: true })
    ReactGA.event({
      category: 'Contact us',
      action: 'Click',
      label: 'Submit'
    })
  },
  displayName: 'BasicForm' // helps with React DevTools
})(MyInnerForm)

export default EnhancedForm
