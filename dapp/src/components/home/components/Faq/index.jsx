import React from 'react'
import FAQ from 'constants/faq'

export default (props) => {
  return (
    FAQ.map(({ question, answer }, index) => {
      return (
        <div className='faq' key={index}>
          <h4 className='faq__title'>{question}</h4>
          <p className='faq__content'>{answer}</p>
          <span className='faq__read'>Read more</span>
          <br />
        </div>
      )
    })
  )
}
