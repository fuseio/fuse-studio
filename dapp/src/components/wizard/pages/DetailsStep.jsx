import React from 'react'
import { getIn, useFormikContext } from 'formik'
import { withStyles } from '@material-ui/styles'
import MuiExpansionPanel from '@material-ui/core/Accordion'
import MuiExpansionPanelSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionActions'
import Typography from '@material-ui/core/Typography'

import TotalSupply from 'components/wizard/components/TotalSupply'
import LogosOptions from 'components/wizard/components/LogosOptions'
import CurrencySymbol from 'components/wizard/components/CurrencySymbol'
import CurrencyType from 'components/wizard/components/CurrencyType'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
import { withNetwork } from 'containers/Web3'

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
})(AccordionDetails)

const DropDownIcon = () => <img src={CaretDown} />

const DetailsStep = () => {
  const formik = useFormikContext()
  const communityType = getIn(formik.values, 'communityType')

  return (
    <div className='accordion'>
      <ExpansionPanel defaultExpanded>
          <Typography component='div' className='accordion__button'>Token</Typography>
        <ExpansionPanelDetails className='accordion__panel'>
          <Typography component='div'>
            <CurrencyType />
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
          <Typography className='accordion__button'>Community</Typography>
        <ExpansionPanelDetails className='accordion__panel'>
          <Typography component='div'>
            <div className='grid-x'>
              <LogosOptions />
              <CoverPhoto />
            </div>
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  )
}

export default withNetwork(DetailsStep)
