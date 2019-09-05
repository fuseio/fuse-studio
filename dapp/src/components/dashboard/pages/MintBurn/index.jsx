import React, { Fragment, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import capitalize from 'lodash/capitalize'
import { formatWei } from 'utils/format'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import MintBurnForm from 'components/dashboard/components/MintBurnForm'
import { mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { toWei } from 'web3-utils'
import Message from 'components/common/SignMessage'
import { getForeignNetwork } from 'selectors/network'

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
  networkType,
  balances,
  symbol,
  tokenNetworkType,
  token,
  isMinting,
  isBurning,
  mintToken,
  burnToken,
  mintSignature,
  burnSignature,
  accountAddress,
  transactionStatus,
  clearTransactionStatus,
  onlyOnNetwork,
  tokenOfCommunityOnCurrentSide
}) => {
  const { address: tokenAddress } = token
  const tabsClasses = useTabsStyles()
  const tabClasses = useTabStyles()
  const [value, setValue] = useState(0)
  const [mintMessage, setMintMessage] = useState(false)
  const [burnMessage, setBurnMessage] = useState(false)
  const foreignNetwork = useSelector(getForeignNetwork)

  const balance = balances[tokenOfCommunityOnCurrentSide]

  const mintHandler = (amount) => {
    onlyOnNetwork(() => mintToken(tokenAddress, toWei(String(amount))), foreignNetwork)
  }

  const burnHandler = (amount) => {
    onlyOnNetwork(() => burnToken(tokenAddress, toWei(String(amount))), foreignNetwork)
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
            <span className='amount'>{`(${capitalize(networkType)}) `}{balance ? formatWei(balance, 0) : 0}</span>
            <small className='symbol'>{symbol}</small>
          </div>
          <MintBurnForm
            error={error}
            balance={balance ? formatWei(balance, 0) : 0}
            handleMintOrBurnClick={mintHandler}
            tokenNetworkType={tokenNetworkType}
            token={token}
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
            <span className='amount'>{`(${capitalize(networkType)}) `}{balance ? formatWei(balance, 0) : 0}</span>
            <small className='symbol'>{symbol}</small>
          </div>
          <MintBurnForm
            error={error}
            balance={balance ? formatWei(balance, 0) : 0}
            handleMintOrBurnClick={burnHandler}
            tokenNetworkType={tokenNetworkType}
            token={token}
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
  homeNetwork: state.network.homeNetwork
})

const mapDispatchToProps = {
  mintToken,
  burnToken,
  clearTransactionStatus
}

export default connect(mapStateToProps, mapDispatchToProps)(MintBurn)
