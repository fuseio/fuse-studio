import React from 'react'
import classNames from 'classnames'
import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'
import { isMobileOnly } from 'react-device-detect'

const communityTypes = [{ 'text': 'Mintable burnable token', 'img': MintableBurnable, value: 'mintableBurnable' }, { 'text': 'One time issuer token', 'img': OneTimeIssuer, value: 'basic' }]

const CurrencyType = ({ communityType, setCommunityType, nextAttribute }) => {
  const handleClick = (item) => {
    setCommunityType(item)
    if (isMobileOnly) {
      nextAttribute()
    }
  }

  return (
    <div className='attributes__attribute'>
      <h3 className='attributes__title'>
        Currency Type
      </h3>
      <div className='attributes__types'>
        {
          communityTypes.map(({ text, img }, key) => {
            const classes = classNames({
              'attributes__types__item': true,
              'attributes__types__item--chosen': communityType.text === text
            })
            return (
              <div className={classes} key={key} onClick={() => handleClick(communityTypes[key])}>
                <img src={img} />
                <span>{text}</span>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CurrencyType
