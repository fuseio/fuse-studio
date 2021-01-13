import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import { ReactComponent as ExpandMoreIcon } from 'images/plus_icon.svg'

const faq = [
  {
    question: 'What is Fuse token?',
    Answer: () => (
      <>
        Fuse token is the fuel for the Fuse ecosystem. Any transactions on fuse network requires you to pay Fuse to get them approved.
      </>
    )
  },
  {
    question: 'Why is Fuse token needed?',
    Answer: () => (
      <>
        The Fuse network was built as a completely free and open source infrastructure for the purpose of building a
        network of operators, users and service providers to use it for payments.
        <br />
        Most business models in the payments industry are either fee or licensing based,
        or sometimes they are free except companies make money on data. On Fuse the transactions are paid in
        the Fuse token. Also Fuse tokens are used for Voting, Validation, delegation. We have other use cases
        for Fuse token planned which will be revealed in coming days.
      </>
    )
  },
  {
    question: 'Where can I buy Fuse token? ',
    Answer: () => (
      <>
        You can buy Fuse token (Fusenet) on our own dex Fuseswap.
        <br />
        You can buy Fuse token (Mainnet) on Uniswap, 1inch, Kyber.
      </>
    )
  }
]
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: '3em'
  },
  root2: {
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
        {
          faq.map(({ question, Answer }, index) => {
            return (
              <Accordion
                key={index}
                square
                className={classNames(classes.root2)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls='panel1a-content'
                  id={index}
                >
                  <Typography className='accordion__title'>
                    {question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className='accordion__details'>
                    <Answer />
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )
          })
        }
      </div>
    </div>
  )
}

export default Questions
