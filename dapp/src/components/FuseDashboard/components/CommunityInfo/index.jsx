import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { useDispatch } from 'react-redux'
import { formatWei, addressShortener } from 'utils/format'
import { loadModal } from 'actions/ui'
import { QR_MODAL } from 'constants/uiConstants'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

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

const CommunityInfo = () => {
  const { dashboard } = useStore()
  const dispatch = useDispatch()
  const type = dashboard?.homeToken?.tokenType && dashboard?.homeToken?.tokenType === 'mintableBurnable'
    ? 'Mintable burnable token'
    : dashboard?.homeToken?.tokenType === 'basic'
      ? 'One time issued token'
      : 'Imported'

  const homeTokenBalance = Number(dashboard?.communityTotalSupply?.home.div(1e18).toFixed())
  const foreignTokenBalance = Number(dashboard?.communityTotalSupply?.foreign.div(1e18).toFixed())
  const total = Number(dashboard?.communityTotalSupply?.total.div(1e18).toFixed())

  const {
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
            symbol={dashboard?.homeToken?.symbol}
            tokenType={`(${type})`}
          />
          <TitleValue title='Total entities'>
            <span>{dashboard?.entitiesCount ?? 0}</span>
          </TitleValue>
          <TitleValue title='Currency address'>
            <div className='grid-x'>
              <span>{addressShortener(dashboard?.community?.homeTokenAddress)}</span>
              <CopyToClipboard text={dashboard?.community?.homeTokenAddress}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(dashboard?.community?.homeTokenAddress)}><FontAwesome name='qrcode' /></div>
            </div>
          </TitleValue>
          <TitleValue title='Community address'>
            <div className='grid-x'>
              <span>{addressShortener(dashboard?.communityAddress)}</span>
              <CopyToClipboard text={dashboard?.communityAddress}>
                <div className='copy'><FontAwesome name='clone' /></div>
              </CopyToClipboard>
              <div className='copy copy--spaced' onClick={() => loadQrModal(dashboard?.communityAddress)}><FontAwesome name='qrcode' /></div>
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
            {dashboard?.communityTotalSupply?.total ? formatWei(dashboard?.communityTotalSupply?.total, 2, dashboard?.homeToken?.decimals) : 0} <small>{dashboard?.homeToken?.symbol}</small>
          </p>
          <p>
            <span className='dot dot--fuse' />
            <span className='title'>Supply on Fuse:</span>
            {dashboard?.communityTotalSupply?.home ? formatWei(dashboard?.communityTotalSupply?.home, 2, dashboard?.homeToken?.decimals) : 0} <small>{dashboard?.homeToken?.symbol}</small> ({(percentOnHome && (`${percentOnHome.toFixed(2)}%`)) || '0%'})
          </p>
          <p>
            <span className='dot dot--main' />
            <span className='title'>Supply on Ethereum:</span>
            {dashboard?.communityTotalSupply?.foreign ? formatWei(dashboard?.communityTotalSupply?.foreign, 2, dashboard?.homeToken?.decimals) : 0} <small>{dashboard?.homeToken?.symbol}</small> ({(percentOnForeign && (`${percentOnForeign.toFixed(2)}%`)) || '0%'})
          </p>
          {
            dashboard?.isAdmin && (
              <p>
                <span className='title'>Funder balance:</span>
                {dashboard?.fuseBalance ? formatWei(dashboard?.fuseBalance, 2, 18) : 0} <small>FUSE</small>
              </p>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default observer(CommunityInfo)
