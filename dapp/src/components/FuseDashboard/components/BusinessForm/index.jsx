import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import omit from 'lodash/omit'
import capitalize from 'lodash/capitalize'
import Select from 'react-select'
import { Form, Formik } from 'formik'
import entityShape from 'utils/validation/shapes/entity'
import { businessTypes, options } from 'constants/dropdownOptions'
import FontAwesome from 'react-fontawesome'
import TextField from '@material-ui/core/TextField'
import TransactionButton from 'components/common/TransactionButton'
import CreatableSelect from 'react-select/creatable'

const createUserOptions = (users) => users.map(user => ({ value: user.address, label: user.address }))

const BusinessForm = ({ submitEntity, uploadImage, isJoin, users, entity }) => {
  const onSubmit = (values) => {
    const entity = omit(values, 'selectedType')
    submitEntity(entity)
  }

  // const handleUploadImage = (photoFile, e) => {
  //   if (photoFile.size <= 2500000) {
  //     const formData = new window.FormData()
  //     formData.append('path', new window.Blob([photoFile]))

  //     uploadImage(formData)
  //   } else {
  //     e.target.value = null
  //     this.setState({ showFileSizeModal: true })
  //   }
  // }

  const renderForm = ({ touched, setFieldTouched, setFieldValue, isValid, errors, values, handleChange, ...rest }) => {
    return (
      <Form className='user-form'>
        <h5 className='user-form__title'>
          {isJoin ? 'Join community' : 'Add new business'}
        </h5>
        <div className='user-form__field user-form__field--space-bottom'>
          <TextField
            onBlur={() => setFieldTouched('name', true)}
            label='Business name'
            name='name'
            fullWidth
            type='search'
            required
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
            <div className='grid-x align-middle'>
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
              <div className='uploader' style={{ marginLeft: '20px' }}>
                <span className='uploader__title'>
                  Cover photo
                  <FontAwesome name='info-circle' />
                </span>

                <label className='uploader__label' htmlFor='uploadCoverImage'>
                  {
                    !values.coverPhoto
                      ? (
                        <Fragment>
                          Upload image
                          <input
                            className='uploader__input'
                            name='coverPhoto'
                            id='uploadCoverImage'
                            type='file'
                            accept='image/*'
                            onChange={(event) => setFieldValue('coverPhoto', event.target.files[0])}
                          />
                        </Fragment>
                      ) : (
                        <div className='uploader__label__value'>
                          {values.coverPhoto.name}
                        </div>
                      )
                  }
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='grid-x align-justify' style={{ marginTop: '20px' }}>
          <div className='cell small-10'>
            <h2 className='user-form__label'>Business type <span>*</span></h2>
            <Select
              name='type'
              className='user-form__field__select'
              classNamePrefix='user-form__field__select__prefix'
              error={errors && errors.type && true}
              options={businessTypes()}
              placeholder={'Choose type'}
              onChange={val => {
                setFieldValue('selectedType', val)
                setFieldValue('type', val.value)
              }}
            />
          </div>
          <div className='cell small-10'>
            <h2 className='user-form__label'>Business Account <span>*</span></h2>
            <div className='user-form__field'>
              <CreatableSelect
                name='account'
                className='user-form__field__select'
                placeholder={'Choose account'}
                classNamePrefix='user-form__field__select__prefix'
                error={errors && errors.type && true}
                options={createUserOptions(users)}
                onChange={val => {
                  setFieldValue('selectedType', val)
                  setFieldValue('account', val.value)
                }}
              />
            </div>
          </div>
        </div>
        <div className='grid-x align-justify cell'>
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
              label='Email'
              name='email'
              type='search'
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
              label='Website'
              name='website'
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
          <div className='user-form__field user-form__field--space-bottom'>
            <TextField
              label='More details'
              name='details'
              type='search'
              className='cell'
              onChange={handleChange}
              autoComplete='off'
              margin='normal'
              multiline
              rows='3'
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
        <div className='user-form__submit'>
          <TransactionButton frontText={isJoin ? 'Join' : 'Add business'} type='submit' disabled={!isValid} />
        </div>
      </Form>
    )
  }

  return (
    <Formik
      initialValues={{
        name: get(entity, 'name', ''),
        address: get(entity, 'address', ''),
        email: get(entity, 'email', ''),
        phoneNumber: get(entity, 'phoneNumber', ''),
        website: get(entity, 'website', ''),
        description: get(entity, 'description', ''),
        type: get(entity, 'type', '', ''),
        account: get(entity, 'account', ''),
        selectedType: options().some(({ value }) => value === get(entity, 'type', '')) ? {
          value: get(entity, 'type', ''),
          label: capitalize(get(entity, 'type', ''))
        } : {},
        image: null,
        coverPhoto: null,
        details: get(entity, 'details', '')
      }}
      validationSchema={entityShape}
      onSubmit={onSubmit}
      validateOnMount
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}

BusinessForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

export default BusinessForm
