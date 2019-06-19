import React, { Component } from 'react'
import PropTypes from 'prop-types'
import omit from 'lodash/omit'
import get from 'lodash/get'
import { Formik, Field, ErrorMessage } from 'formik'
import userEntity from 'utils/validation/shapes/userEntity'
import TransactionButton from 'components/common/TransactionButton'
import Select from 'react-select'
import CountriesList from 'constants/countries'

class AddUserForm extends Component {
  constructor (props) {
    super(props)

    const { entity } = props

    this.initialValues = {
      firstName: '',
      lastName: '',
      email: '',
      mainPhoneNumber: '',
      secondPhoneNumber: '',
      country: '',
      city: '',
      address: '',
      account: get(entity, 'account', '')
    }

    this.validationSchema = userEntity
  }

  onSubmit = (values) => {
    const {
      submitEntity
    } = this.props

    const entity = omit(values, 'selectedType')

    submitEntity(entity)
  }

  renderForm = ({ handleSubmit, setFieldValue, setFieldTouched, values, isValid }) => {
    return (
      <form className='user-form' onSubmit={handleSubmit}>
        <h5 className='user-form__title'>Add new user</h5>
        <div className='user-form__field'>
          <label className='user-form__field__label'>First name</label>
          <Field
            name='firstName'
            className='user-form__field__input'
          />
          <ErrorMessage name='firstName' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Last name</label>
          <Field
            name='lastName'
            className='user-form__field__input'
          />
          <ErrorMessage name='lastName' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Phone number</label>
          <div className='user-form__field__phone'>
            <Field
              name='mainPhoneNumber'
              className='user-form__field__phone__input'
            />
            <Field
              className='user-form__field__phone__input'
              name='secondPhoneNumber'
            />
          </div>
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Email</label>
          <Field
            name='email'
            className='user-form__field__input'
          />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Country</label>
          <Select
            name='country'
            className='user-form__field__select'
            classNamePrefix='user-form__field__select__prefix'
            options={CountriesList}
            placeholder={'Select Country...'}
            onChange={val => setFieldValue('country', val)}
          />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>City</label>
          <Field
            name='city'
            className='user-form__field__input'
          />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Address</label>
          <Field
            name='address'
            className='user-form__field__input'
          />
        </div>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Ethereum account</label>
          <Field
            name='account'
            className='user-form__field__input'
          />
          <ErrorMessage name='account' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='user-form__submit'>
          <TransactionButton type='submit' disabled={!isValid} />
        </div>
      </form>
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        onSubmit={this.onSubmit}
        isInitialValid={false}
      />
    )
  }
}

AddUserForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

export default AddUserForm
