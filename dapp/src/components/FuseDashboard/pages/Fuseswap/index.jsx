import React from 'react'
import get from 'lodash/get'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'

const Fuseswap = () => {
  const { dashboard } = useStore()
  const plugin = get(dashboard?.plugins, 'fuseswap', {})
  const widgetUrl = `${plugin?.widgetUrl + dashboard?.community?.homeTokenAddress}` ?? ''
  return (
    <>
      <div className='fuseswap__header'>
        <h2 className='fuseswap__header__title'>Create Fuseswap pool</h2>
      </div>
      <div className='fuseswap__wrapper'>
        <div className='fuseswap__container'>
          Fuseswap is a decentralized exchange that allows anybody with tokens on Fuse to trade their tokens against a smart contract that is managing a liquidity pool.
          It allows for users of the Studio that create a currency, to create a liquidity pool on Fuseswap and let others trade this coin.
          <br />
          In order to create the pool, please go to the following link and add your token along with another currency so the pair can have an exchange rate. You can read more about adding liquidity on the docs.
          <br />
          <p>
            Please <a className='fuseswap__link' rel='noopener noreferrer' target='_blank' href={widgetUrl}>Click here</a> to set up your liquidity pool.
          </p>
        </div>
      </div>
    </>
  )
}

export default observer(Fuseswap)
