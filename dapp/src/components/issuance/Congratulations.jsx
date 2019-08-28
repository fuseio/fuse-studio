import React from 'react'
import Box from 'images/box.svg'
import confe from 'images/confe.svg'
import confeRight from 'images/confe_right.svg'

const Congratulations = ({ goToDashboard }) => {
  return (
    <div className='congratulation'>
      <div className='congratulation__title'>
        Congratulations!
      </div>
      <div className='congratulation__sub-title'>
        <img src={confe} />
        On the birth of your community!
        <img src={confeRight} />
      </div>
      <p className='congratulation__fuse-text'>You have been awarded with 10 Fuse tokens on Fuse Network</p>
      <div className='congratulation__boxImg'>
        <img alt='box' src={Box} />
      </div>
      <p className='congratulation__what-small'>What's that?</p>
      <div className='congratulation__what'>What should i do next?</div>
      <div className='congratulation__text'>to start building your community. Your community will now show on the homepage of the Fuse Studio. Go to your community page to start adding businesses and users.</div>
      <div className='congratulation__btn'>
        <button className='button button--big' onClick={goToDashboard}>Go to the community page</button>
      </div>
    </div>
  )
}

export default Congratulations
