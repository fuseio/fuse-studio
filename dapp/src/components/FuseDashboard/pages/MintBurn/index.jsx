import React, { Fragment, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import capitalize from 'lodash/capitalize'
import { formatWei, toWei } from 'utils/format'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import MintBurnForm from 'components/FuseDashboard/components/MintBurnForm'
import { mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import Message from 'components/common/SignMessage'
import { getForeignNetwork, getHomeNetworkType, getCurrentNetworkType } from 'selectors/network'
import { getBalances, getAccountAddress } from 'selectors/accounts'
import { convertNetworkName } from 'utils/network'
import { getHomeTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'

const TabPanel = (props) => {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component='div'
      role='tabpanel'
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      <div style={{ padding: '40px' }}>{children}</div>
    </Typography>
  )
}

const a11yProps = (index) => ({
  id: `scrollable-force-tab-${index}`,
  'aria-controls': `scrollable-force-tabpanel-${index}`
})

const useTabsStyles = makeStyles(theme => ({
  root: {
    borderBottom: 'solid 1px #e9e9e9',
    paddingTop: '20px'
  },
  indicator: {
    backgroundColor: '#abc3d2'
  }
}))

const useTabStyles = makeStyles(theme => ({
  root: {
    fontSize: '16px',
    fontFamily: `'Gotham SSm A', 'Gotham SSm B', 'icomoon'`
  },
  textColorPrimary: {
    color: '#25435a !important'
  },
  selected: {
    color: '#25435a !important'
  }
}))

const MintBurn = ({
  error,
  token: { symbol, address: tokenAddress, decimals },
  balances,
  isMinting,
  isBurning,
  mintToken,
  burnToken,
  mintSignature,
  burnSignature,
  accountAddress,
  transactionStatus,
  clearTransactionStatus
}) => {
  const tabsClasses = useTabsStyles()
  const tabClasses = useTabStyles()
  const [value, setValue] = useState(0)
  const [mintMessage, setMintMessage] = useState(false)
  const [burnMessage, setBurnMessage] = useState(false)
  const foreignNetwork = useSelector(getForeignNetwork)

  const balance = balances[tokenAddress]

  const mintHandler = (amount) => {
    mintToken(tokenAddress, toWei(String(amount), decimals), { desiredNetworkType: ['fuse'] })
  }

  const burnHandler = (amount) => {
    burnToken(tokenAddress, toWei(String(amount), decimals), { desiredNetworkType: ['fuse'] })
  }

  const handleChange = (event, newValue) => setValue(newValue)

  return (
    <Fragment>
      <div className='mint-burn__header'>
        <h2 className='mint-burn__header__title'>Mint / Burn</h2>
      </div>

      <div className='mint-burn'>
        <Message message={'Pending'} isOpen={isBurning || isMinting} isDark subTitle='' />
        <Message message={'Pending'} isOpen={mintSignature || burnSignature} isDark />
        <Tabs
          classes={tabsClasses}
          value={value}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons='on'
          indicatorColor='primary'
          textColor='primary'
        >
          <Tab classes={tabClasses} label='MINT' {...a11yProps(0)} />
          <Tab classes={tabClasses} label='BURN' {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <div className='mint-burn__balance'>
            <span className='title'>My Balance: </span>
            <span className='amount'>{`(${capitalize(convertNetworkName(foreignNetwork))}) `}{balance ? formatWei(balance, 2, decimals) : 0}</span>
            <small className='symbol'>{symbol}</small>
          </div>
          <MintBurnForm
            error={error}
            balance={balance ? formatWei(balance, 2, decimals) : 0}
            handleMintOrBurnClick={mintHandler}
            tokenNetworkType={foreignNetwork}
            symbol={symbol}
            actionType='mint'
            accountAddress={accountAddress}
            mintMessage={mintMessage}
            transactionStatus={transactionStatus}
            closeMintMessage={() => {
              setMintMessage(false)
              clearTransactionStatus(null)
            }}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className='mint-burn__balance'>
            <span className='title'>My Balance: </span>
            <span className='amount'>{`(${capitalize(convertNetworkName(foreignNetwork))}) `}{balance ? formatWei(balance, 2) : 0}</span>
            <small className='symbol'>{symbol}</small>
          </div>
          <MintBurnForm
            error={error}
            balance={balance ? formatWei(balance, 2) : 0}
            handleMintOrBurnClick={burnHandler}
            tokenNetworkType={foreignNetwork}
            symbol={symbol}
            actionType='burn'
            accountAddress={accountAddress}
            burnMessage={burnMessage}
            transactionStatus={transactionStatus}
            closeBurnMessage={() => {
              setBurnMessage(false)
              clearTransactionStatus(null)
            }}
          />
        </TabPanel>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  homeNetwork: getHomeNetworkType(state),
  accountAddress: getAccountAddress(state),
  networkType: getCurrentNetworkType(state),
  balances: getBalances(state),
  token: getHomeTokenByCommunityAddress(state, getCommunityAddress(state)) || { symbol: '', address: '' }
})

const mapDispatchToProps = {
  mintToken,
  burnToken,
  clearTransactionStatus
}

export default connect(mapStateToProps, mapDispatchToProps)(MintBurn)
