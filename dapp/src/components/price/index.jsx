import React from 'react'
import classNames from 'classnames'
import Questions from './questions'
import Calculator from './txs_calulator'
import PriceImage from 'images/price_image.svg'
import FuseIcon from 'images/fuse_icon.svg'
import FeesIcon from 'images/fees.svg'
import CheckGreen from 'images/check_green.svg'

const includedList = [
  'Access token issuance wizard',
  "Access powerful backend API's",
  'Add functionality with plugins',
  'Make your token usable with fee abstraction',
  'Customizable mobile wallet'
]

function Rect ({ title, modifier, icon }) {
  return (
    <div className={classNames('rect', { [`rect--${modifier}`]: modifier })}>
      <div className='rect__title'>{title}</div>
      <img src={icon} />
    </div>
  )
}

function Price () {
  return (
    <div className='price'>
      <div className='section_one__wrapper'>
        <div className='section_one grid-x align-justify align-middle'>
          <div className='section_one__content cell large-12'>
            <div className='section_one__title'>Pay no more than $0.01 per transaction regardless of size</div>
            {/* <div className='section_one__sub_title'>Pay no more than <span>$0.01 cent per transaction</span> regardless of size.</div> */}
            <div className='included'>
              <div className='included__title'>included</div>
              <div className='included__list'>
                {
                  includedList.map((item, index) => (
                    <div className='item' key={index}>
                      <div className='item__icon'>
                        <img src={CheckGreen} />
                      </div>
                      <div className='text'>{item}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          <div className='section_one__image cell large-12 grid-x align-middle'>
            <img src={PriceImage} className='cell' />
          </div>
        </div>
      </div>

      <Calculator />

      <div className='section_three'>
        <div className='section_three__wrapper'>
          <div className='cell medium-24 large-11 grid-y align-center align-middle'>
            <Rect modifier='fuse' title='Fuse token (FUSE)' icon={FuseIcon} />
            <Rect modifier='grey' title='Transactions fees' icon={FeesIcon} />
          </div>
          <div className='cell medium-20 grid-y align-center align-middle'>
            <div className='section_three__text'>
              Fuse token (FUSE) is the native currency on the Fuse blockchain and is required to pay fees to the network in order to approve transactions.
              <br />
              <br />
              Unlike the traditional banking infrastructure which is centrally owned and managed, blockchains are decentralized. owned and token holders and validators that help process transactions on the network.
            </div>
          </div>
        </div>
      </div>

      <Questions />
    </div>
  )
}

export default Price
