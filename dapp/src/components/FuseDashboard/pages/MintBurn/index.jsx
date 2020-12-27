import React, { Fragment, useState } from 'react'
import capitalize from 'lodash/capitalize'
import { formatWei, toWei } from 'utils/format'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import MintBurnForm from 'components/FuseDashboard/components/MintBurnForm'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'
import { mint, burn } from 'utils/token'

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

const MintBurn = () => {
  const { dashboard, network } = useStore()
  const decimals = dashboard?.homeToken?.decimals
  const tokenAddress = dashboard?.homeToken?.address
  const { tokenContext } = dashboard
  const { token, tokenNetworkName } = tokenContext
  const balance = tokenContext.tokenBalance
  const { accountAddress, web3Context } = network
  const symbol = token?.symbol

  const tabsClasses = useTabsStyles()
  const tabClasses = useTabStyles()
  const [value, setValue] = useState(0)

  const makeMint = (amount) =>
    mint({ tokenAddress, to: accountAddress, amount: toWei(String(amount), decimals) }, web3Context)

  const makeBurn = (amount) =>
    burn({ tokenAddress, amount: toWei(String(amount), decimals) }, web3Context)

  const handleChange = (event, newValue) => setValue(newValue)

  const handleConfirmation = () => dashboard?.fetchTokenBalances(accountAddress)

  return (
    <>
      <div className='mint-burn__header'>
        <h2 className='mint-burn__header__title'>Mint / Burn</h2>
      </div>

      <div className='mint-burn'>
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
            <span className='amount'>{`(${capitalize(tokenNetworkName)}) `}{balance ? formatWei(balance, 2, decimals) : 0}</span>
            <small className='symbol'>{symbol}</small>
          </div>
          <MintBurnForm
            balance={balance ? formatWei(balance, 2, decimals) : 0}
            makeTransaction={makeMint}
            desiredNetworkName={tokenNetworkName}
            symbol={symbol}
            actionType='mint'
            onConfirmation={handleConfirmation}
            accountAddress={accountAddress}
            pendingText=''
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className='mint-burn__balance'>
            <span className='title'>My Balance: </span>
            <span className='amount'>{`(${capitalize(tokenNetworkName)}) `}{balance ? formatWei(balance, 2) : 0}</span>
            <small className='symbol'>{dashboard?.homeToken?.symbol}</small>
          </div>
          <MintBurnForm
            balance={balance ? formatWei(balance, 2) : 0}
            makeTransaction={makeBurn}
            desiredNetworkName={tokenNetworkName}
            symbol={symbol}
            actionType='burn'
            onConfirmation={handleConfirmation}
            accountAddress={accountAddress}
            pendingText=''
          />
        </TabPanel>
      </div>
    </>
  )
}

export default observer(MintBurn)
