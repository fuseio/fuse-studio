import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import omit from 'lodash/omit'
import get from 'lodash/get'
import { Formik, Form } from 'formik'
import userEntity from 'utils/validation/shapes/userEntity'
import TransactionButton from 'components/common/TransactionButton'
import Select from 'react-select'
import CountriesList from 'constants/countries'
import TextField from '@material-ui/core/TextField'
import FontAwesome from 'react-fontawesome'
import MenuItem from '@material-ui/core/MenuItem'
import { connect } from 'react-redux'
import { getUser3boxData } from 'selectors/accounts'

const AddUserForm = (props) => {
  const { submitEntity, isJoin, entity, userData: { publicData, privateData } } = props

  const onSubmit = (values) => {
    const entity = omit(values, 'selectedType')

    submitEntity(entity)
  }

  const renderForm = ({ touched, setFieldTouched, setFieldValue, isValid, errors, values, handleChange }) => {
    return (
      <Form className='user-form'>
        <h5 className='user-form__title'>
          {isJoin ? 'Join community' : 'Add new user'}
        </h5>
        <div className='user-form__field user-form__field--space-bottom'>
          <TextField
            onBlur={() => setFieldTouched('name', true)}
            label='Full name'
            name='name'
            fullWidth
            value={values.name}
            type='search'
            autoComplete='off'
            margin='normal'
            error={errors && errors.name && touched.name && true}
            onChange={handleChange}
            InputProps={{
              classes: {
                underline: 'user-form__field__underline',
                error: 'user-form__field__error'
              }
            }}
            InputLabelProps={{
              shrink: true,
              className: 'user-form__field__label'
            }}
          />
        </div>
        <div className='grid-x align-middle user-form__more-info'>
          <div className='user-form__field'>
            <TextField
              label='Ethereum account'
              name='account'
              type='search'
              fullWidth
              value={values.account}
              onBlur={() => setFieldTouched('account', true)}
              error={errors && errors.account && touched.account && true}
              autoComplete='off'
              onChange={handleChange}
              margin='normal'
              InputProps={{
                classes: {
                  root: 'input__root',
                  focused: '',
                  error: 'user-form__field__error',
                  underline: 'user-form__field__underline'
                }
              }}
              InputLabelProps={{
                classes: {
                  root: 'user-form__field__label2'
                }
              }}
            />
          </div>
        </div>
        <div className='user-form__submit'>
          <TransactionButton frontText={isJoin ? 'Join' : 'Add user'} type='submit' disabled={!isValid} />
        </div>
      </Form>
    )
  }

  return (
    <Formik
      initialValues={{
        name: get(publicData, 'name', ''),
        email: get(privateData, 'email', ''),
        phoneNumber: '',
        country: '',
        status: '',
        address: get(publicData, 'address', ''),
        account: get(entity, 'account', ''),
        image: null
      }}
      validationSchema={userEntity}
      onSubmit={onSubmit}
      validateOnMount
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}

AddUserForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

const mapPropsToState = (state) => ({
  userData: getUser3boxData(state)
})

export default connect(mapPropsToState, null)(AddUserForm)
