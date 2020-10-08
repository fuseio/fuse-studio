import React from 'react'
import faqItems from 'constants/faq'
import arrow from 'images/arrow_3.svg'

export default () => {
  return (
    <div className='faq__wrapper'>
      <div className='grid-x align-justify align-middle faq__title'>
        <h3 className='faq__title'>FAQ</h3>
        <a href='https://www.youtube.com/watch?v=Lh3pKLdUR60' target='_blank' rel='noopener noreferrer' className='faq__action'>
          Watch tutorial&nbsp;<img src={arrow} alt='arrow' />
        </a>
      </div>
      <div className='faq__questions'>
        {faqItems.map(({ question, link, answer }, index) => (
          <div className='faq' key={index}>
            <h4 className='faq__title'>Q:&nbsp;&nbsp;{question}</h4>
            <div className='faq__content grid-x align-middle'>
              <div>{answer}</div>
              &nbsp;&nbsp;<a className='faq__read' href={link} target='_blank' rel='noopener noreferrer'>Read more</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
