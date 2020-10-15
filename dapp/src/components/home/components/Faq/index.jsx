import React, { Fragment } from 'react'
import faqItems from 'constants/faq'
import arrow from 'images/arrow_3.svg'

export default () => {
  return (
    <Fragment>
      <div className='faq__wrapper cell medium-24 large-12'>
        <div className='grid-x align-justify align-middle faq__title'>
          <h3 className='faq__title'>FAQ</h3>
          <a href='https://docs.fuse.io/the-fuse-studio/faq' target='_blank' rel='noopener noreferrer' className='faq__action'>
            Learn more&nbsp;<img src={arrow} alt='arrow' />
          </a>
        </div>
        <div className='faq__questions grid-y align-top align-justify'>
          {faqItems.map(({ question, link, answer }, index) => (
            <div className='faq cell shrink' key={index}>
              <h4 className='faq__title'>Q:&nbsp;&nbsp;{question}</h4>
              <div className='faq__content'>
                <div>{answer}</div>
                &nbsp;&nbsp;<a className='faq__read' href={link} target='_blank' rel='noopener noreferrer'>Read more</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='faq__wrapper cell medium-24 large-12' style={{ backgroundColor: '#f5f5f5' }}>
        <div className='grid-x align-justify align-middle faq__title'>
          <h3 className='faq__title'>Watch tutorial</h3>
        </div>
        <div style={{ position: 'relative', height: 0, overflow: 'hidden', maxWidth: '100%', paddingBottom: '56.25%' }}>
          <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} allowFullScreen frameBorder='0' src='https://www.youtube.com/embed/Lh3pKLdUR60?autoplay=1&mute=1' />
        </div>
      </div>
    </Fragment>
  )
}
