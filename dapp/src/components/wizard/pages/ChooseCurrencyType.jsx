import React, { Fragment } from 'react'
import { Field, connect, getIn } from 'formik'
import classNames from 'classnames'
import createNewToken from 'images/create_new_token.svg'
import existingToken from 'images/existing_token.svg'

const CurrencyOption = ({ account, logo, name, value }) => {
  return (
    <Field
      name='currency'
      render={({ field, form: { setFieldValue } }) => (
        <Fragment>
          <label htmlFor={value} className={classNames('option option--fullWidth grid-x align-middle', { 'option--selected': field.value === value })}>
            <input
              style={{ display: 'none' }}
              id={value}
              value={value}
              type='radio'
              checked={field.value === value}
              onChange={(e) => {
                setFieldValue('currency', e.target.value)
                if (value === 'new') {
                  setFieldValue('communitySymbol', '')
                  setFieldValue('existingToken', '')
                  setFieldValue('customToken', '')
                }
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
    />
  )
}

const ChooseCurrencyType = ({
  formik
}) => {
  const network = getIn(formik.values, 'network')

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
          name={`Use an existing token on Ethereum ${network}`}
          value='existing'
        />
      </div>
    </div>
  )
}

export default connect(ChooseCurrencyType)
