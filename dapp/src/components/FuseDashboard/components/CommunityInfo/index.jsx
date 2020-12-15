import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import get from 'lodash/get'
import { formatWei, addressShortener } from 'utils/format'
import { BigNumber } from 'bignumber.js'
import { getCurrentCommunity } from 'selectors/dashboard'
import { loadModal } from 'actions/ui'
import { QR_MODAL } from 'constants/uiConstants'

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
  communityAddress,
  homeTokenAddress,
  foreignTokenAddress,
  tokenType,
  symbol,
  decimals
}) => {
  const dispatch = useDispatch()
  const entities = useSelector(getCurrentCommunity)
  const tokensTotalSupplies = useSelector(state => get(state, 'screens.dashboard.totalSupply'), 0)
  const type = tokenType && tokenType === 'mintableBurnable'
    ? 'Mintable burnable token'
    : tokenType === 'basic'
      ? 'One time issued token'
      : 'Imported'

  let totalSupply = 0
  let homeTokenSupply = 0
  let foreignTokenSupply = 0
  const homeBalance = tokensTotalSupplies && tokensTotalSupplies.hasOwnProperty(homeTokenAddress) ? tokensTotalSupplies[homeTokenAddress] : 0
  const foreignBalance = tokensTotalSupplies && tokensTotalSupplies.hasOwnProperty(foreignTokenAddress) ? tokensTotalSupplies[foreignTokenAddress] : 0

  if (tokensTotalSupplies) {
    homeTokenSupply = new BigNumber(homeBalance)
    foreignTokenSupply = foreignBalance ? new BigNumber(foreignBalance).minus(homeBalance) : foreignBalance
    totalSupply = new BigNumber(foreignTokenSupply).plus(homeTokenSupply)
  }

  const total = Number(new BigNumber(totalSupply).div(1e18).toFixed())
  const homeTokenBalance = Number(new BigNumber(homeTokenSupply).div(1e18).toFixed())
  const foreignTokenBalance = Number(new BigNumber(foreignTokenSupply).div(1e18).toFixed())

  let {
    percentOnHome,
    percentOnForeign
  } = percentOnSide(total, homeTokenBalance, foreignTokenBalance)

  const loadQrModal = (value) => {
    dispatch(loadModal(QR_MODAL, { value }))
  }

  return (
    <div className='community_info__wrapper'>
      <div className='community_info__general'>
        <h3 className='community_info__title'>General information</h3>
        <div className='community_info__content'>
          <TitleValue
            title='Currency'
            symbol={symbol}
            tokenType={`(${type})`}
          />
          <TitleValue title='Total entities'>
            <span>{(entities && entities.result && entities.result.length) || 0}</span>
          </TitleValue>
          <TitleValue title='Currency address'>
            <div className='grid-x'>
              <span>{addressShortener(homeTokenAddress)}</span>
              <CopyToClipboard text={homeTokenAddress}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(homeTokenAddress)}><FontAwesome name='qrcode' /></div>
            </div>
          </TitleValue>
          <TitleValue title='Community address'>
            <div className='grid-x'>
              <span>{addressShortener(communityAddress)}</span>
              <CopyToClipboard text={communityAddress}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(communityAddress)}><FontAwesome name='qrcode' /></div>
            </div>
          </TitleValue>
        </div>
      </div>
      <div className='community_info__supply_pie'>
        <div className='pie__wrapper--container'>
          <div className='pie__wrapper'>
            <div className='pie' data-start='0' data-value={Math.round(percentOnHome) || 0} />
            <div className='pie big' data-start={Math.round(percentOnHome) || 0} data-value={Math.round(percentOnForeign) || 0} />
          </div>
        </div>
        <div className='grid-y total__sides'>
          <p>
            <span className='title'>Total supply</span>
            {formatWei(totalSupply, 2, decimals)} <small>{symbol}</small>
          </p>
          <p>
            <span className='dot dot--fuse' />
            <span className='title'>Supply on Fuse:</span>
            {formatWei(homeTokenSupply, 2, decimals)} <small>{symbol}</small> ({(percentOnHome && (`${percentOnHome.toFixed(2)}%`)) || '0%'})
          </p>
          <p>
            <span className='dot dot--main' />
            <span className='title'>Supply on Ethereum:</span>
            {formatWei(foreignTokenSupply, 2, decimals)} <small>{symbol}</small> ({(percentOnForeign && (`${percentOnForeign.toFixed(2)}%`)) || '0%'})
          </p>
        </div>
      </div>
    </div>
  )
}

export default CommunityInfo
