import React from 'react'
import classNames from 'classnames'
import { isMobileOnly } from 'react-device-detect'
import Select from 'react-select'
import Carousel from 'components/common/Carousel'
import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'
import DefaultIcon from 'images/coin_default.svg'
import { existingTokens } from 'constants/existingTokens'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import { Field, connect, getIn } from 'formik'

const communityTypes = [
  { 'text': 'Mintable/Burnable token', 'img': MintableBurnable, value: 'mintableBurnable', tooltipText: `This allows community manager to mint or burn tokens and fully control the token supply. Those types of tokens are used for credit-like or reward systems that can be used by any organization.` },
  { 'text': 'One time issued token', 'img': OneTimeIssuer, value: 'basic', tooltipText: `Those types of tokens could be minted once and their supply is fixed. This allows to create assets which are digitally scarce and can be produced in limited supply. Usually to achieve a higher level of protection and guarantee no one can create more coins of this type can protect its value and decentralization.` },
  { 'text': 'Use existing token', 'img': DefaultIcon, value: 'existingToken', tooltipText: `Any existing coin that is ERC-20 compatible could be integrated into your community. We currently support DAI and will be adding more stable-coins very soon. Any stable coin that is operating on the Ethereum network could be plugged into your community. ` }
]

const Option = (props) => {
  const { children, className, cx, isDisabled, isFocused, isSelected, innerRef, innerProps, data } = props
  return (
    <div
      ref={innerRef}
      className={cx(
        {
          'option': true,
          'option--is-disabled': isDisabled,
          'option--is-focused': isFocused,
          'option--is-selected': isSelected
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

const CurrencyType = ({ formik, communityType = { text: '' }, setCommunityType, networkType, setExistingToken, existingToken }) => {
  const handleClick = (item) => {
    setCommunityType(item)
  }

  const communityTypeValue = getIn(formik.values, 'communityType')

  return (
    <div className='attributes__attribute attributes__attribute--long-height'>
      <h3 className='attributes__title'>
        Currency Type
      </h3>
      {
        isMobileOnly ? (
          <Carousel>
            {
              communityTypes.map(({ text, img, value, tooltipText }, key) => {
                const classes = classNames({
                  'attributes__types__item': true,
                  'attributes__types__item--chosen': communityType.text === text
                })
                return (
                  <div className={classes} key={key} onClick={() => handleClick(communityTypes[key])}>
                    <span>{text} <FontAwesome data-tip data-for={value} name='info-circle' /></span>
                    <ReactTooltip className='tooltip__content' id={value} place='bottom' effect='solid'>
                      <div>{tooltipText}</div>
                    </ReactTooltip>
                    <img src={value === 'existingToken' && communityType && communityType.value === 'existingToken' && existingToken && existingToken.value ? existingToken.icon : img} />
                    {
                      value === 'existingToken' && (
                        <div className='attributes__types__select__wrapper'>
                          <Select
                            className='attributes__types__select'
                            classNamePrefix='attributes__types__select__prefix'
                            components={{ Option }}
                            options={existingTokens(networkType)}
                            placeholder={'Choose token'}
                            onChange={(val, e) => setExistingToken(val)}
                          />
                        </div>
                      )
                    }
                  </div>
                )
              })
            }
          </Carousel>
        ) : (
          <div className='attributes__types'>
            {
              communityTypes.map(({ text, img, value, tooltipText }, key) => {
                const classes = classNames({
                  'attributes__types__item': true,
                  'attributes__types__item--chosen': communityTypeValue && communityTypeValue.text === text
                })
                return (
                  <Field key={key}>
                    {({ field, form: { setFieldValue, values } }) => (
                      <div name='communityType' className={classes} onClick={() => setFieldValue('communityType', communityTypes[key])}>
                        <span>{text} <FontAwesome data-tip data-for={value} name='info-circle' /></span>
                        <ReactTooltip className='tooltip__content' id={value} place='bottom' effect='solid'>
                          <div>{tooltipText}</div>
                        </ReactTooltip>
                        <img src={value === 'existingToken' && communityType && communityType.value === 'existingToken' && values.existingToken && values.existingToken.value ? existingToken.icon : img} />
                        {
                          value === 'existingToken' && (
                            <Field name='existingToken'>
                              {({ field, form: { setFieldValue, values } }) => (
                                <div className='attributes__types__select__wrapper'>
                                  <Select
                                    className='attributes__types__select'
                                    classNamePrefix='attributes__types__select__prefix'
                                    components={{ Option }}
                                    options={existingTokens(networkType)}
                                    placeholder={'Choose token'}
                                    onChange={(val) => setFieldValue('existingToken', val)}
                                  />
                                </div>
                              )}
                            </Field>
                          )
                        }
                      </div>
                    )}
                  </Field>
                )
              })
            }
          </div>
        )
      }

    </div>
  )
}

export default connect(CurrencyType)
