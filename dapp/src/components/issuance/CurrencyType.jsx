import React from 'react'
import classNames from 'classnames'
import { isMobileOnly } from 'react-device-detect'
import Select from 'react-select'
import Carousel from 'components/common/Carousel'
import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'
import DefaultIcon from 'images/coin_default.svg'
import { existingTokens } from 'constants/existingTokens'

const communityTypes = [
  { 'text': 'Mintable burnable token', 'img': MintableBurnable, value: 'mintableBurnable' },
  { 'text': 'One time issuer token', 'img': OneTimeIssuer, value: 'basic' },
  { 'text': 'Existing token', 'img': DefaultIcon, value: 'existingToken' }
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

export default ({ communityType = { text: '' }, setCommunityType, networkType, setExistingToken }) => {
  const handleClick = (item) => {
    setCommunityType(item)
  }

  return (
    <div className={classNames('attributes__attribute')}>
      <h3 className='attributes__title'>
        Currency Type
      </h3>
      {
        isMobileOnly ? (
          <Carousel>
            {
              communityTypes.map(({ text, img, value }, key) => {
                const classes = classNames({
                  'attributes__types__item': true,
                  'attributes__types__item--chosen': communityType.text === text
                })
                return (
                  <div className={classes} key={key} onClick={() => handleClick(communityTypes[key])}>
                    <span>{text}</span>
                    <img src={img} />
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
              communityTypes.map(({ text, img, value }, key) => {
                const classes = classNames({
                  'attributes__types__item': true,
                  'attributes__types__item--chosen': communityType.text === text
                })
                return (
                  <div className={classes} key={key} onClick={() => handleClick(communityTypes[key])}>
                    <span>{text}</span>
                    <img src={img} />
                    {
                      value === 'existingToken' && (
                        <div className='attributes__types__select__wrapper'>
                          <Select
                            className='attributes__types__select'
                            classNamePrefix='attributes__types__select__prefix'
                            components={{ Option }}
                            options={existingTokens(networkType)}
                            placeholder={'Choose token'}
                            onChange={(val) => setExistingToken(val)}
                          />
                        </div>
                      )
                    }
                  </div>
                )
              })
            }
          </div>
        )
      }

    </div>
  )
}
