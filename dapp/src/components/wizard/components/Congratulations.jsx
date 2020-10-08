import React, { Fragment } from 'react'
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import capitalize from 'lodash/capitalize'
import { convertNetworkName } from 'utils/network'

import Box from 'images/box.svg'

const Congratulations = ({ networkType, goToDashboard }) => {
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
        <p className='congratulation__fuse-text'>
          You have been awarded with {networkType === 'ropsten' ? '10' : '100'} Fuse tokens for launching on Ethereum {capitalize(convertNetworkName(networkType))} network
          &nbsp;<small>(<a target='_blank' rel='noopener noreferrer' href='https://docs.fuse.io/the-fuse-chain/fuse-token'>What's that?</a>)</small>
        </p>
        <div className='congratulation__boxImg'>
          <img alt='box' src={Box} />
        </div>
        <div className='congratulation__what'>Now what?</div>
        <div className='congratulation__text'>Your economy will now show up on the homepage of the Fuse Studio. Go to your community page to start adding features and onboarding users!</div>
        <div className='congratulation__btn'>
          <button className='button button--big' onClick={goToDashboard}>Go to the community page</button>
        </div>
      </div>
    </Fragment>
  )
}

export default Congratulations
