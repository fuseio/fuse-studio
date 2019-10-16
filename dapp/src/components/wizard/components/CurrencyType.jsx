import React, { Fragment } from 'react'
import Select from 'react-select'
import CommunityTypes from 'constants/communityTypes'
import { existingTokens } from 'constants/existingTokens'
import { Field, connect, getIn } from 'formik'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import classNames from 'classnames'

const Option = (props) => {
  const { children, className, cx, isDisabled, isFocused, isSelected, innerRef, innerProps, data } = props
  return (
    <div
      ref={innerRef}
      className={cx(
        {
          'option-item': true,
          'option-item--is-disabled': isDisabled,
          'option-item--is-focused': isFocused,
          'option-item--is-selected': isSelected
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

const CurrencyType = ({ networkType, formik }) => {
  const communityType = getIn(formik.values, 'communityType')
  const existingToken = getIn(formik.values, 'existingToken')

  return (
    <div className='attributes__currency'>
      <h3 className='attributes__title'>
        Currency Type
      </h3>
      <div className='attributes__types'>
        <Field
          name='communityType'
          render={({ field, form: { setFieldValue } }) => {
            return (
              <div className='attributes__options'>
                <Select
                  {...field}
                  onChange={val => {
                    setFieldValue('communityType', val)
                    setFieldValue('existingToken', '')
                  }}
                  className={classNames('attributes__options__select', { 'attributes__options__select--selected': communityType })}
                  classNamePrefix='attributes__options__select__prefix'
                  components={{ Option }}
                  options={CommunityTypes}
                  placeholder={'I want to make new currency'}
                />
              </div>
            )
          }}
        />
        <Field
          name='existingToken'
          render={({ field, form: { setFieldValue } }) => (
            <div className='attributes__options'>
              <Select
                {...field}
                onChange={val => {
                  setFieldValue('existingToken', val)
                  setFieldValue('communityType', '')
                }}
                className={classNames('attributes__options__select', { 'attributes__options__select--selected': existingToken })}
                classNamePrefix='attributes__options__select__prefix'
                components={{ Option }}
                options={existingTokens(networkType)}
                placeholder={'I want to use existing currency'}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default connect(CurrencyType)
