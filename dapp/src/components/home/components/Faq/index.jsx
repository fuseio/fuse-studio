import React from 'react'
import FAQ from 'constants/faq'
import arrow from 'images/arrow_3.svg'

export default () => {
  return (
    <div className='faq__wrapper'>
      {FAQ.map(({ question }, index) => {
        return (
          <div className='faq' key={index}>
            <h4 className='faq__title'>Q:&nbsp;&nbsp;</h4>
            <p className='faq__content'>{question}</p>
            <br />
          </div>
        )
      })}
      <a href='https://docs.fuse.io/the-fuse-studio/faq' target='_blank' rel='noopener noreferrer' className='faq__action'>
        Learn more&nbsp;<img src={arrow} alt='arrow' />
      </a>
    </div>
  )
}
