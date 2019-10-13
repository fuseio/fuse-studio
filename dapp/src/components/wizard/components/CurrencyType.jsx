import React from 'react'
// import classNames from 'classnames'
// import { isMobileOnly } from 'react-device-detect'
import Select from 'react-select'
// import Carousel from 'components/common/Carousel'
import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'
// import DefaultIcon from 'images/coin_default.svg'
import { existingTokens } from 'constants/existingTokens'
// import FontAwesome from 'react-fontawesome'
// import ReactTooltip from 'react-tooltip'
import { Field, connect } from 'formik'

const CommunityTypes = [
  { label: 'Mintable/Burnable token', icon: MintableBurnable, value: 'mintableBurnable', tooltipText: `This allows community manager to mint or burn tokens and fully control the token supply. Those types of tokens are used for credit-like or reward systems that can be used by any organization.` },
  { label: 'One time issued token', icon: OneTimeIssuer, value: 'basic', tooltipText: `Those types of tokens could be minted once and their supply is fixed. This allows to create assets which are digitally scarce and can be produced in limited supply. Usually to achieve a higher level of protection and guarantee no one can create more coins of this type can protect its value and decentralization.` },
  // { label: 'Use existing token', icon: DefaultIcon, value: 'existingToken', tooltipText: `Any existing coin that is ERC-20 compatible could be integrated into your community. We currently support DAI and will be adding more stable-coins very soon. Any stable coin that is operating on the Ethereum network could be plugged into your community. ` }
]

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
      <span>{children}</span>
    </div>
  )
}

const CurrencyType = ({ networkType }) => {
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
                  className='attributes__options__select'
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
          render={({ field, form: { handleChange, setFieldValue } }) => (
            <div className='attributes__options'>
              <Select
                {...field}
                onChange={val => {
                  setFieldValue('existingToken', val)
                  setFieldValue('communityType', '')
                }}
                className='attributes__options__select'
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
