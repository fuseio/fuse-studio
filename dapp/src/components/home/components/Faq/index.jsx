import React from 'react'
import faqItems from 'constants/faq'
import arrow from 'images/arrow_3.svg'

export default () => {
  return (
    <div className='faq__wrapper cell large-auto'>
      <div className='grid-x align-justify align-middle faq__title'>
        <h3 className='faq__title'>FAQ</h3>
        <a href='https://tutorials.fuse.io/tutorials/studio-tutorials' target='_blank' rel='noopener noreferrer' className='faq__action'>
          Learn more&nbsp;<img src={arrow} alt='arrow' />
        </a>
      </div>
      <div className='faq__questions__wrapper grid-x align-middle'>
        <div className='faq__questions grid-y align-top align-justify cell medium-14 small-24'>
          {faqItems.map(({ question, link, answer }, index) => (
            <div className='faq cell shrink' key={index}>
              <h4 className='faq__title'>Q:&nbsp;&nbsp;{question}</h4>
              <div className='faq__content'>
                <div>{answer}</div>&nbsp;&nbsp;
                {link && <a className='faq__read' href={link} target='_blank' rel='noopener noreferrer'>Read more</a>}
              </div>
            </div>
          ))}
        </div>
        <div className='cell large-auto small-24'>
          <div style={{ position: 'relative', height: 0, overflow: 'hidden', maxWidth: '100%', paddingBottom: '56.25%', borderRadius: '10px' }}>
            <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} allowFullScreen frameBorder='0' src='https://www.youtube.com/embed/Lh3pKLdUR60?autoplay=0&mute=1' />
          </div>
        </div>
      </div>
    </div>
  )
}
