import React, { Fragment } from 'react'
import Box from 'images/box.svg'
// import confe from 'images/confe.svg'
// import confeRight from 'images/confe_right.svg'

import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

const Congratulations = ({ goToDashboard }) => {
  const { width, height } = useWindowSize()
  return (
    <Fragment>
      <Confetti
        width={width}
        height={height}
      />
      <div className='congratulation'>
        <div className='congratulation__title'>
          Congratulations!
        </div>
        {/* <div className='congratulation__sub-title'>
          <img src={confe} />
          On the birth of your community!
          <img src={confeRight} />
        </div> */}
        <p className='congratulation__fuse-text'>You have been awarded with 10 Fuse tokens on the Fuse Network
          <small>(<a target='_blank' rel='noopener noreferrer' href='https://docs.fuse.io/the-fuse-chain/fuse-token'>What's that?</a>)</small>
        </p>
        <div className='congratulation__boxImg'>
          <img alt='box' src={Box} />
        </div>
        <div className='congratulation__what'>What should i do next?</div>
        <div className='congratulation__text'>to start building your community. Your community will now show on the homepage of the Fuse Studio. Go to your community page to start adding features to it.</div>
        <div className='congratulation__btn'>
          <button className='button button--big' onClick={goToDashboard}>Go to the community page</button>
        </div>
      </div>
    </Fragment>
  )
}

export default Congratulations
