import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { formatWei, formatAddress } from 'utils/format'
import { BigNumber } from 'bignumber.js'

const percentOnSide = (total, homeTokenBalance, foreignTokenBalance) => {
  const calc = (value) => value * 100 / total
  const percentOnHome = calc(homeTokenBalance)
  const percentOnForeign = calc(foreignTokenBalance)

  return {
    percentOnHome,
    percentOnForeign
  }
}

const TitleValue = ({ title, symbol, tokenType, children }) => (
  <div className='title_value grid-y align-justify'>
    <span className='title_value__title'>{title}</span>
    {children || <p className='title_value__value'><strong>{symbol}</strong>{tokenType}</p>}
  </div>
)

const CommunityInfo = ({
  token,
  balances,
  loadQrModal,
  communityAddress,
  homeTokenAddress,
  foreignTokenAddress,
  tokensTotalSupplies
}) => {
  const { symbol, tokenType, address } = token
  const type = tokenType === 'mintableBurnable'
    ? 'Mintable burnable token'
    : tokenType === 'basic'
      ? 'One time issuer token'
      : 'Imported'

  let totalSupply2 = 0
  let homeTokenBalance2 = 0
  let foreignTokenBalance2 = 0

  if (tokensTotalSupplies && tokensTotalSupplies[homeTokenAddress] && tokensTotalSupplies[foreignTokenAddress]) {
    homeTokenBalance2 = new BigNumber(tokensTotalSupplies[homeTokenAddress])
    foreignTokenBalance2 = new BigNumber(tokensTotalSupplies[foreignTokenAddress]).minus(tokensTotalSupplies[homeTokenAddress])
    totalSupply2 = new BigNumber(foreignTokenBalance2).plus(homeTokenBalance2)
  }

  const total = Number(new BigNumber(totalSupply2).div(1e18).toFixed())
  const homeTokenBalance = Number(new BigNumber(homeTokenBalance2).div(1e18).toFixed())
  const foreignTokenBalance = Number(new BigNumber(foreignTokenBalance2).div(1e18).toFixed())

  let {
    percentOnHome,
    percentOnForeign
  } = percentOnSide(total, homeTokenBalance, foreignTokenBalance)

  return (
    <div className='community_info__wrapper'>
      <div className='community_info__general'>
        <h3 className='community_info__title'>General information</h3>
        <div className='community_info__content'>
          <TitleValue title='Currency' symbol={symbol} tokenType={`(${type})`} />
          <TitleValue title='Total entities'>
            <span>0</span>
          </TitleValue>
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
      <div className='community_info__line' />
      <div className='community_info__supply_pie'>
        <div className='pie__wrapper--container'>
          <div className='pie__wrapper'>
            <div className='pie' data-start='0' data-value={Math.round(percentOnHome) || 0} />
            <div className='pie big' data-start={Math.round(percentOnHome) || 0} data-value={Math.round(percentOnForeign) || 0} />
          </div>
        </div>
        <div className='grid-y total__sides'>
          <h6>
            <span className='title'>Total supply</span>
            {formatWei(totalSupply2, 0)} <small>{symbol}</small>
          </h6>
          <p>
            <span className='dot dot--fuse' />
            <span className='title'>Supply on Fuse:</span>
            {formatWei(homeTokenBalance2, 0)} <small>{symbol}</small> ({(percentOnHome && (`${percentOnHome.toFixed(2)}%`)) || '0%'})
          </p>
          <p>
            <span className='dot dot--main' />
            <span className='title'>Supply on Ethereum:</span>
            {formatWei(foreignTokenBalance2, 0)} <small>{symbol}</small> ({(percentOnForeign && (`${percentOnForeign.toFixed(2)}%`)) || '0%'})
          </p>
        </div>
      </div>
    </div>
  )
}

export default CommunityInfo
