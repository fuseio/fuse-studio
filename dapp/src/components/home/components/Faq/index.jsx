import React from 'react'

export default (props) => {
  return (
    [1, 2, 3].map((val, index) => {
      return (
        <div className='faq' key={index}>
          <h4 className='faq__title'>How is FAQ pronounced?</h4>
          <p className='faq__content'>Luram ipsum bla bla bla bla bla bla bla bla bla blabla bla…</p>
          <span className='faq__read'>Read more</span>
          <br />
        </div>
      )
    })
  )
}
