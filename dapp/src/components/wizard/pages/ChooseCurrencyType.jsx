import React, { Fragment, useEffect } from 'react'
import { Field, useFormikContext, getIn } from 'formik'
import classNames from 'classnames'
import createNewToken from 'images/create_new_token.svg'
import existingToken from 'images/existing_token.svg'
import { nameToSymbol } from 'utils/format'

const CurrencyOption = ({ logo, name, value }) => {
  return (
    <Field name='currency'>
      {({ field, form: { setFieldValue } }) => (
        <Fragment>
          <label htmlFor={value} className={classNames('option option--fullWidth grid-x align-middle', { 'option--selected': field.value === value })}>
            <input
              style={{ display: 'none' }}
              id={value}
              value={value}
              type='radio'
              checked={field.value === value}
              onChange={(e) => {
                if (value === 'new') {
                  setFieldValue('existingToken', '')
                  setFieldValue('customToken', '')
                } else {
                  setFieldValue('communityType', '')
                  setFieldValue('customToken', '')
                }
                setFieldValue('currency', e.target.value)
              }}
            />
            <div className='option__logo grid-x align-center cell small-4'>
              <img src={logo} />
            </div>
            <div className='option__text option__text--big cell large-auto'>
              {name}
            </div>
          </label>
        </Fragment>
      )}
    </Field>
  )
}

const ChooseCurrencyType = () => {
  const formik = useFormikContext()
  const communityName = getIn(formik.values, 'communityName')
  const currency = getIn(formik.values, 'currency')

  useEffect(() => {
    if (currency === 'new') {
      formik.setFieldValue('communitySymbol', nameToSymbol(communityName))
    }
  }, [currency])

  return (
    <div className='options__wrapper grid-y align-spaced'>
      <div className='options grid-x'>
        <CurrencyOption
          logo={createNewToken}
          name='Create a new token'
          value='new'
        />
        <CurrencyOption
          logo={existingToken}
          name='Use an existing token on Fuse'
          value='existing'
        />
      </div>
    </div>
  )
}

export default ChooseCurrencyType
