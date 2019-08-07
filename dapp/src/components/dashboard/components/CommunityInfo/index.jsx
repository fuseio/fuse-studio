import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { formatWei, formatAddress } from 'utils/format'
import { BigNumber } from 'bignumber.js'

const TitleValue = ({ title, symbol, tokenType, children }) => {
  return (
    <div className='title_value grid-y align-justify cell small-12' style={{ height: '50px' }}>
      <span className='title_value__title'>{title}</span>
      {
        children || <p className='title_value__value'><strong>{symbol}</strong>{tokenType}</p>
      }
    </div>
  )
}

const percentOnSide = (total, homeTokenBalance, foreignTokenBalance) => {
  const percentOnHome = homeTokenBalance * 100 / total
  const percentOnForeign = foreignTokenBalance * 100 / total

  return {
    percentOnHome,
    percentOnForeign
  }
}

const CommunityInfo = ({
  token,
  balances,
  loadQrModal,
  communityAddress,
  homeTokenAddress,
  foreignTokenAddress
}) => {
  const { symbol, tokenType, address, totalSupply } = token
  const type = tokenType === 'mintableBurnable'
    ? 'Mintable burnable token'
    : tokenType === 'basic'
      ? 'One time issuer token'
      : 'Imported'

  const total = Number(new BigNumber(totalSupply).div(1e18).toFixed())
  const homeTokenBalance = Number(new BigNumber(balances[homeTokenAddress]).div(1e18).toFixed())
  const foreignTokenBalance = Number(new BigNumber(balances[foreignTokenAddress]).div(1e18).toFixed())
  let {
    percentOnHome,
    percentOnForeign
  } = percentOnSide(total, homeTokenBalance, foreignTokenBalance)

  return (
    <div className='community_info__wrapper'>
      <div className='community_info__general'>
        <h3 className='community_info__title'>General information</h3>
        <div className='grid-x grid-margin-y grid-margin-x'>
          <div className='cell grid-x' style={{ marginBottom: '40px' }}>
            <TitleValue title='Currency' symbol={symbol} tokenType={`(${type})`} />
            <TitleValue title='Total entities'>
              <span>0</span>
            </TitleValue>
          </div>
          <TitleValue title='Currency address'>
            <div className='grid-x'>
              <span>{formatAddress(address)}</span>
              <CopyToClipboard text={address}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(address)}><FontAwesome name='qrcode' /></div>
            </div>
          </TitleValue>
          <TitleValue title='Community address'>
            <div className='grid-x'>
              <span>{formatAddress(communityAddress)}</span>
              <CopyToClipboard text={communityAddress}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(communityAddress)}><FontAwesome name='qrcode' /></div>
            </div>
          </TitleValue>
        </div>
      </div>
      <div className='community_info__supply_pie'>
        <div className='pie__wrapper'>
          <div className='pie' data-start='0' data-value={Math.round(percentOnHome) || 0} />
          <div className='pie big' data-start={Math.round(percentOnHome) || 0} data-value={Math.round(percentOnForeign) || 0} />
        </div>
        <div className='grid-y total__sides'>
          <h6>
            <span className='title'>Total supply</span>
            {formatWei(totalSupply, 0)} <small>{symbol}</small>
          </h6>
          <p>
            <span className='dot dot--fuse' />
            <span className='title'>Supply on Fuse:</span>
            {(percentOnHome && (`${percentOnHome.toFixed(4)}%`)) || '0%'} ({formatWei(balances[homeTokenAddress], 0)} <small>{symbol}</small>)
          </p>
          <p>
            <span className='dot dot--main' />
            <span className='title'>Supply on Ethereum:</span>
            {(percentOnForeign && (`${percentOnForeign.toFixed(4)}%`)) || '0%'} ({formatWei(balances[foreignTokenAddress], 0)} <small>{symbol}</small>)
          </p>
        </div>
      </div>
    </div>
  )
}

export default CommunityInfo
