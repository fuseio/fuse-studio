import React, { Fragment, useEffect, useState } from 'react'
import Select from 'react-select'
import CommunityTypes from 'constants/communityTypes'
import { dollarPeggedTokens, otherExistingTokens } from 'constants/existingTokens'
import { Field, connect, getIn } from 'formik'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress, toChecksumAddress } from 'web3-utils'
import { fetchTokenFromEthereum } from 'actions/token'

const Option = (props) => {
  const { children, className, cx, isDisabled, innerRef, innerProps, data } = props
  return (
    <div
      ref={innerRef}
      className={cx(
        {
          'option-item': true,
          'option-item--is-disabled': isDisabled
        },
        className
      )}
      {...innerProps}
    >
      {data && data.icon && <span className='icon'><img src={data.icon} /></span>}
      {
        data.tooltipText ? (
          <Fragment>
            <span>{data.label} <FontAwesome data-tip data-for={data.value} name='info-circle' /></span>
            <ReactTooltip className='tooltip__content' id={data.value} place='bottom' effect='solid'>
              <div>{data.tooltipText}</div>
            </ReactTooltip>
          </Fragment>
        ) : <span>{children}</span>
      }
    </div>
  )
}

const CustomToken = connect((props) => {
  const { formik } = props
  const [isDone, setDone] = useState(false)
  const dispatch = useDispatch()
  const tokenAddress = getIn(formik.values, 'customToken')
  const network = getIn(formik.values, 'network')
  const token = useSelector(state => tokenAddress && state.entities.tokens[isAddress(tokenAddress) ? toChecksumAddress(tokenAddress) : tokenAddress])
  const isToken = useSelector(state => tokenAddress && state.screens.issuance.isTokens[isAddress(tokenAddress) ? toChecksumAddress(tokenAddress) : tokenAddress] && state.screens.issuance.isTokens[isAddress(tokenAddress) ? toChecksumAddress(tokenAddress) : tokenAddress])

  useEffect(() => {
    if (tokenAddress && token && isDone && isToken) {
      formik.setFieldValue('communitySymbol', token.symbol)
      formik.setFieldValue('totalSupply', '')
      formik.setFieldValue('communityType', '')
      formik.setFieldValue('existingToken', '')
    }
  }, [tokenAddress, token, isDone, isToken])

  const fetchCustomToken = (e) => {
    if (isAddress(e.target.value)) {
      dispatch(fetchTokenFromEthereum(toChecksumAddress(e.target.value)))
      setDone(true)
    }
  }

  return (
    <div className='customToken'>
      {network === 'ropsten' && <div className='attributes__title'>Custom token:</div>}
      <div className='customToken__field'>
        <Field
          name='customToken'
          render={({ field, form: { handleChange } }) => (
            <TextField
              {...field}
              onChange={(e) => {
                handleChange(e)
                fetchCustomToken(e)
              }}
              type='text'
              placeholder={`Enter ethereum token address`}
              classes={{
                root: 'customToken__field'
              }}
              inputProps={{
                maxLength: '42',
                autoComplete: 'off'
              }}
              InputProps={{
                classes: {
                  underline: 'customToken__field--underline',
                  error: 'customToken__field--error'
                }
              }}
            />
          )}
        />
        {isToken == null && (
          <div className='customToken__img'>
            <div className='customToken__loader' />
          </div>
        )}
      </div>
      {isToken === false && (
        <div style={{ color: '#fa6400', fontSize: '0.57em', fontWeight: '500' }}>
          <FontAwesome name='info-circle' />&nbsp;
          This token is not supported! reason: not an ERC20 token
        </div>
      )}
    </div>
  )
})

const CurrencyType = ({ networkType, formik }) => {
  const existingToken = getIn(formik.values, 'existingToken')
  const currency = getIn(formik.values, 'currency')
  const network = getIn(formik.values, 'network')
  const isNew = currency === 'new'
  const isExisting = currency === 'existing'
  const groupedOptions = [
    {
      label: 'Dollar pegged:',
      options: dollarPeggedTokens(networkType)
    },
    {
      label: 'Other:',
      options: otherExistingTokens(networkType)
    }
  ]

  return (
    <div className='attributes__currency'>
      {isNew && <h3 className='attributes__title'>
        Create new token<span style={{ fontSize: 'smaller', fontWeight: '400' }}> | select one</span>
      </h3>}
      {isExisting && network !== 'ropsten' && <h3 className='attributes__title'>
        Pick one of the two options:
      </h3>}
      <div className='options grid-x align-middle align-justify'>
        {isNew && (
          CommunityTypes.map((item, index) => {
            const {
              label,
              icon,
              value,
              tooltipText
            } = item
            return (
              <Fragment key={value}>
                <Field
                  name='communityType'
                  render={({ field, form: { setFieldValue } }) => {
                    return (
                      <div
                        onClick={() => {
                          setFieldValue('communityType', item)
                        }}
                        className={classNames('option option--small cell small-11 large-11 grid-x align-middle', { 'option--selected': field.value === item })}>
                        <div className='option__logo option__logo--small grid-x align-center cell small-6'>
                          <img src={icon} />
                        </div>
                        <Fragment>
                          <div className='option__text cell large-auto'>
                            <span>{label} <FontAwesome data-tip data-for={value} name='info-circle' /></span>
                            <ReactTooltip className='tooltip__content' id={value} place='bottom' effect='solid'>
                              <div>{tooltipText}</div>
                            </ReactTooltip>
                          </div>
                        </Fragment>
                      </div>
                    )
                  }}
                />
                {index === 0 && <p className='or cell shrink'>OR</p>}
              </Fragment>
            )
          })
        )}
        {isExisting && (
          <Fragment>
            {network !== 'ropsten' && (
              <Fragment>
                <div className='cell large-11 grid-x align-middle'>
                  <Field
                    name='existingToken'
                    render={({ field, form: { setFieldValue } }) => (
                      <Select
                        {...field}
                        onChange={val => {
                          setFieldValue('existingToken', val)
                          setFieldValue('totalSupply', '')
                          setFieldValue('communityType', '')
                          setFieldValue('communitySymbol', val.symbol)
                          setFieldValue('customToken', '')
                          if (window && window.analytics) {
                            window.analytics.track(`Existing currency - ${val.label}`)
                          }
                        }}
                        className={classNames('attributes__options__select', { 'attributes__options__select--selected': existingToken })}
                        classNamePrefix='attributes__options__select__prefix'
                        options={groupedOptions}
                        components={{ Option }}
                        placeholder={'Choose a currency'}
                      />
                    )}
                  />
                </div>
                <p className='or cell shrink'>OR</p>
              </Fragment>
            )}
            <div className='cell large-11'>
              <CustomToken />
            </div>
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default connect(CurrencyType)
