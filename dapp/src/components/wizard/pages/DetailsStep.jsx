import React from 'react'
import { connect, getIn } from 'formik'
import filter from 'lodash/filter'
import { withStyles } from '@material-ui/styles'
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel'
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'

import TotalSupply from 'components/wizard/components/TotalSupply'
import LogosOptions from 'components/wizard/components/LogosOptions'
import CurrencySymbol from 'components/wizard/components/CurrencySymbol'
import CurrencyType from 'components/wizard/components/CurrencyType'
// import Plugins from 'components/wizard/components/Plugins'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
// import CommunityStatus from 'components/wizard/components/CommunityStatus'

import CaretDown from 'images/drop-down.svg'

const ExpansionPanel = withStyles({
  root: {
    border: 'solid 1px #c3c3c3',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  rounded: {
    '&:first-child': {
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px'
    },
    '&:last-child': {
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px'
    }
  },
  expanded: {}
})(MuiExpansionPanel)

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: '#F8F8F8'
  },
  content: {
    justifyContent: 'space-between'
  }
})(MuiExpansionPanelSummary)

const ExpansionPanelDetails = withStyles({
  root: {
    display: 'flex',
    padding: '24px'
  }
})(MuiExpansionPanelDetails)

const DropDownIcon = () => <img src={CaretDown} />

const DetailsStep = ({
  formik,
  networkType
}) => {
  const communityType = getIn(formik.values, 'communityType')
  const plugins = getIn(formik.values, 'plugins')
  const countOfSelectedPlugins = React.useMemo(() => filter(plugins, 'isActive').length, [plugins])

  return (
    <div className='accordion'>
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          classes={{
            root: 'ExpansionPanelSummary--first'
          }}
          expandIcon={<DropDownIcon />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography component='div' className='accordion__button'>Token</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className='accordion__panel'>
          <Typography component='div'>
            <CurrencyType networkType={networkType} />
            {
              communityType && communityType.value && communityType.label && (
                <TotalSupply />
              )
            }
            <CurrencySymbol />
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<DropDownIcon />}
          aria-controls='panel2a-content'
          id='panel2a-header'
        >
          <Typography className='accordion__button'>Community</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className='accordion__panel'>
          <Typography component='div'>
            <div className='grid-x'>
              <LogosOptions />
              <CoverPhoto />
            </div>
            {/* <CommunityStatus /> */}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* <ExpansionPanel>
        <ExpansionPanelSummary
          classes={{
            root: 'ExpansionPanelSummary--last'
          }}
          expandIcon={<DropDownIcon />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography component='div' className='accordion__button'>
            Plugins <a target='_blank' rel='noopener noreferrer' href='https://medium.com/fusenet/how-to-add-functionality-to-your-community-introducing-plug-ins-209933e5c4ed'>(What this?)</a>
          </Typography>
          <Typography component='div' className='accordion__button--sub-title'>({countOfSelectedPlugins} selected)</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className='accordion__panel'>
          <Typography component='div'>
            <Plugins />
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel> */}
    </div>
  )
}

export default connect(DetailsStep)
