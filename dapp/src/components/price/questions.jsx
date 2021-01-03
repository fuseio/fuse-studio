import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import { ReactComponent as ExpandMoreIcon } from 'images/plus_icon.svg'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: '3em'
  },
  root2: {
    borderBottom: '2px solid #DDE8F0',
    borderTop: '2px solid #DDE8F0',
    boxShadow: 'none'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}))

function Questions() {
  const classes = useStyles()
  return (
    <div className='questions'>
      <div className='title'>Frequently Asked Questions</div>
      <div className={classNames(classes.root)}>
        <Accordion
          square
          className={classNames(classes.root2)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1a-content'
            id='panel1a-header'
          >
            <Typography className='accordion__title'>
              How do I get FUSE get tokens?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className='accordion__details'>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae iusto ducimus veniam doloremque. Iusto incidunt possimus sed eligendi soluta tempora fuga, ex doloribus! Consequuntur, facilis autem suscipit atque accusamus expedita?
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  )
}

export default Questions
