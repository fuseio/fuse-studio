import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import omit from 'lodash/omit'
import get from 'lodash/get'
import { Formik } from 'formik'
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

  const renderForm = ({ handleSubmit, touched, setFieldTouched, setFieldValue, isValid, errors, values, handleChange }) => {
    return (
      <form className='user-form' onSubmit={handleSubmit}>
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
        <div className='grid-x align-middle'>
          <div className='grid-y'>
            <h2 className='user-form__label'>Image</h2>
            <div className='uploader'>
              <span className='uploader__title'>
                Logo
                <FontAwesome name='info-circle' />
              </span>

              <label className='uploader__label' htmlFor='uploadImage'>
                {
                  !values.image
                    ? (
                      <Fragment>
                        Upload image
                        <input
                          className='uploader__input'
                          name='image'
                          id='uploadImage'
                          type='file'
                          accept='image/*'
                          onChange={(event) => setFieldValue('image', event.target.files[0])}
                        />
                      </Fragment>
                    ) : (
                      <div className='uploader__label__value'>
                        {values.image.name}
                      </div>
                    )
                }
              </label>
            </div>
          </div>

          <div className='grid-y user-form__status'>
            <h2 className='user-form__label'>User status</h2>
            <Select
              name='status'
              className='user-form__field__select'
              classNamePrefix='user-form__field__select__prefix'
              options={[
                {
                  label: 'Community admin',
                  value: 'admin'
                },
                {
                  label: 'Community user',
                  value: 'user'
                }
              ]}
              placeholder={'Choose status'}
              onChange={val => setFieldValue('status', val)}
            />
          </div>
        </div>
        <div className='grid-x align-middle user-form__more-info'>
          <h2 className='user-form__label user-form__label--no-margin'>More info</h2>
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
          <div className='grid-x align-justify cell'>
            <div className='cell small-10'>
              <TextField
                label='Email'
                name='email'
                type='search'
                value={values.email}
                className='cell'
                onChange={handleChange}
                onBlur={() => setFieldTouched('email', true)}
                error={errors && errors.email && touched.email && true}
                autoComplete='off'
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
            <div className='cell small-10'>
              <TextField
                label='Phone'
                name='phoneNumber'
                type='search'
                autoComplete='off'
                className='cell'
                onChange={handleChange}
                margin='normal'
                InputProps={{
                  classes: {
                    root: 'input__root',
                    focused: '',
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
          <div className='grid-x align-justify cell'>
            <div className='cell small-10'>
              <TextField
                label='Country'
                name='country'
                onChange={(value) => setFieldValue('country', value)}
                select
                className='cell'
                autoComplete='off'
                margin='normal'
                value={values.country}
                InputProps={{
                  classes: {
                    root: 'input__root',
                    focused: '',
                    underline: 'user-form__field__underline'
                  }
                }}
                InputLabelProps={{
                  classes: {
                    root: 'user-form__field__label2'
                  }
                }}
              >
                {CountriesList.map((option, index) => (
                  <MenuItem key={`${index}${option.value}`} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className='cell small-10'>
              <TextField
                label='Full address (city & street)'
                name='address'
                type='search'
                className='cell'
                onChange={handleChange}
                autoComplete='off'
                margin='normal'
                InputProps={{
                  classes: {
                    root: 'input__root',
                    focused: '',
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
        </div>
        <div className='user-form__submit'>
          <TransactionButton frontText={isJoin ? 'Join' : 'Add user'} type='submit' disabled={!isValid} />
        </div>
      </form>
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
      render={renderForm}
      onSubmit={onSubmit}
      isInitialValid={false}
    />
  )
}

AddUserForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

const mapPropsToState = (state) => ({
  userData: getUser3boxData(state)
})

export default connect(mapPropsToState, null)(AddUserForm)
