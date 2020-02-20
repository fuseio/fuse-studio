import React, { Fragment, useState } from 'react'
import Select from 'react-select'
import { isAddress, toChecksumAddress } from 'web3-utils'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTokenFromEthereum } from 'actions/token'
import CommunityTypes from 'constants/communityTypes'
import { existingTokens } from 'constants/existingTokens'
import { Field, connect, getIn } from 'formik'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import classNames from 'classnames'
import { nameToSymbol } from 'utils/format'
import TextInput from 'components/common/TextInput'
import get from 'lodash/get'

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
        ) : (
          <span>{children}</span>
        )
      }
    </div>
  )
}

const CustomToken = connect((props) => {
  const { formik } = props
  const [isDone, setDone] = useState(false)
  const dispatch = useDispatch()
  const tokenAddress = getIn(formik.values, 'customToken')
  const token = useSelector(state => state.entities.tokens[isAddress(tokenAddress) ? toChecksumAddress(tokenAddress): tokenAddress])

  if (tokenAddress && token && isDone) {
    props.selectOption({
      label: token.symbol,
      value: toChecksumAddress(tokenAddress),
      isCustom: true,
      ...token
    })
  }
  return (
    <div className='customToken'>
      <div className='customToken__field'>
        <Field
          name='customToken'
          render={({ form: { handleChange } }) => {
            return (
              <TextInput
                id='customToken'
                placeholder='Add your token address'
                type='text'
                autoComplete='off'
                maxLength='42'
                onClick={
                  e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.target.focus()
                  }
                }
                onKeyDown={e => {
                  e.stopPropagation()
                }}
                onChange={handleChange} />
            )
          }
          } />
        <div className='customToken__button'>
          <button
            disabled={!isAddress(tokenAddress)}
            onClick={(e) => {
              if (isAddress(tokenAddress)) {
                dispatch(fetchTokenFromEthereum(toChecksumAddress(tokenAddress)))
                setDone(true)
              }
            }}>Add</button>
        </div>
      </div>
    </div>
  )
})

const Group = (props) => {
  const {
    children,
    className,
    cx,
    getStyles,
    Heading,
    headingProps,
    label,
    theme,
    selectProps
  } = props
  return (
    <div
      style={getStyles('group', props)}
      className={cx({ group: true }, className)}
    >
      <Heading
        {...headingProps}
        selectProps={selectProps}
        theme={theme}
        getStyles={getStyles}
        cx={cx}
      >
        {label}
      </Heading>
      {children && children[0] && children[0].props.label === 'custom'
        ? <CustomToken key={children[0].props.label} {...children[0].props} />
        : <div className='attributes__options__select__prefix__menu'>
          <div className='attributes__options__select__prefix__menu-list'>
            {children.map(ch => <Option key={ch.props.label} {...ch.props} />)}
          </div>
        </div>
      }
    </div>
  )
}

const CurrencyType = ({ networkType, formik }) => {
  const communityType = getIn(formik.values, 'communityType')
  const communityName = getIn(formik.values, 'communityName')
  const existingToken = getIn(formik.values, 'existingToken')
  const groupedOptions = [
    {
      label: 'Choose Token:',
      options: existingTokens(networkType)
    },
    {
      label: 'Custom Token:',
      options: [{
        label: 'custom'
      }]
    }
  ]

  const [menuIsOpen, setMenuIsOpen] = useState(false)

  return (
    <div className='attributes__currency'>
      <h3 className='attributes__title'>
        Currency type<span style={{ fontSize: 'smaller', fontWeight: '400' }}> | Choose one of the options</span>
      </h3>
      <div className='attributes__types'>
        <Field
          name='communityType'
          render={({ field, form: { setFieldValue } }) => {
            return (
              <div className='attributes__options'>
                <Select
                  {...field}
                  isSearchable={false}
                  onChange={val => {
                    setFieldValue('communityType', val)
                    setFieldValue('existingToken', '')
                    setFieldValue('communitySymbol', nameToSymbol(communityName))
                    if (window && window.analytics) {
                      window.analytics.track(`New currency - ${val.label}`)
                    }
                  }}
                  className={classNames('attributes__options__select', { 'attributes__options__select--selected': communityType })}
                  classNamePrefix='attributes__options__select__prefix'
                  components={{ Option }}
                  options={CommunityTypes}
                  placeholder={'I want to create a new currency'}
                />
              </div>
            )
          }}
        />
        <p className='attributes__or'>OR</p>
        <Field
          name='existingToken'
          render={({ field, form: { setFieldValue } }) => (
            <div className='attributes__options'>
              <Select
                {...field}
                isSearchable={false}
                onBlur={e => {
                  if (get(e, 'relatedTarget.id') !== 'customToken') {
                    setMenuIsOpen(false)
                  }
                  // e.preventDefault()
                  // e.stopPropagation()
                }}
                blurInputOnSelect={false}
                // menuIsOpen
                menuIsOpen={menuIsOpen}
                onChange={val => {
                  setFieldValue('existingToken', val)
                  setFieldValue('totalSupply', '')
                  setFieldValue('communityType', '')
                  setFieldValue('communitySymbol', val.symbol)
                  if (window && window.analytics) {
                    window.analytics.track(`Existing currency - ${val.label}`)
                  }
                  setMenuIsOpen(false)
                }}
                onMenuOpen={() => {
                  setMenuIsOpen(true)
                }}
                className={classNames('attributes__options__select', { 'attributes__options__select--selected': existingToken })}
                classNamePrefix='attributes__options__select__prefix'
                components={{ Group }}
                options={groupedOptions}
                placeholder={'I want to use an existing currency'}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default connect(CurrencyType)
