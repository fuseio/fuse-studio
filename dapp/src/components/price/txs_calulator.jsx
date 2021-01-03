import React, { useEffect } from 'react'
import InfoIcon from 'images/information.svg'
import { Formik, Form } from 'formik'
import { number, object } from 'yup'
import Slider from '@material-ui/core/Slider'
import { withStyles } from '@material-ui/styles'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

const formatValue = (num) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

const AirbnbSlider = withStyles({
  root: {
    color: '#0F273C',
    height: 3,
    padding: '13px 0'
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '2px solid #0F273C',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px'
    },
    '& .bar': {
      // display: inline-block !important
      height: 9,
      width: 2,
      backgroundColor: '#0F273C',
      marginLeft: 1,
      marginRight: 1
    }
  },
  active: {},
  track: {
    height: 3
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3
  }
})(Slider)

function AirbnbThumbComponent(props) {
  return (
    <span {...props}>
      <span className='bar' />
      <span className='bar' />
      <span className='bar' />
    </span>
  )
}

function Calculator() {
  const { price } = useStore()
  useEffect(() => {
    price.fetchFusePrice()
  }, [])

  const { fusePrice } = price

  const renderForm = ({ values, setFieldValue }) => {
    const { transaction } = values
    const cost = formatValue(transaction * 0.000003)
    const usdValue = formatValue(cost * fusePrice)
    return (
      <Form className='section__two'>
        <div className='section__two__wrapper'>
          <div className='section__two__title'>Simple pricing</div>
          <div className='section__two__sub_title'>Get all the tools and services and only pay as you go per transaction</div>
          <div className='section__two__info'>
            <div className='item grid-y align-justify'>
              <div className='item__title'>Number of Transactions</div>
              <div className='item__value'>{transaction}</div>
            </div>
            <div className='space' />
            <div className='item grid-y align-justify'>
              <div className='item__title'>Current transaction cost</div>
              <div className='item__value'>$0.000003</div>
            </div>
          </div>
          <AirbnbSlider
            min={1000}
            ThumbComponent={AirbnbThumbComponent}
            max={1000000}
            value={values.transaction}
            step={1}
            defaultValue={1000}
            aria-labelledby='non-linear-slider'
            onChange={(e, value) => {
              setFieldValue('transaction', value)
            }}
          />
          <div className='section__two__box'>
            <span className='cost'>COST</span>
            <div className='content grid-x align-middle'>
              {cost}&nbsp; <span>FUSE</span>&nbsp;
              <div>(<span>$</span>{usdValue})</div>
            </div>
          </div>
          <div className='section__two__fee'>
            <img src={InfoIcon} />
            <div className='text'>Fees may rise in the future but are capped at $0.01 per transaction</div>
          </div>
        </div>
      </Form>
    )
  }

  const onSubmit = (values, formikBag) => {
  }

  return (
    <Formik
      initialValues={{
        transaction: 1000
      }}
      validationSchema={object().noUnknown(false).shape({
        transaction: number().positive().min(1000).max(1000000)
      })}
      onSubmit={onSubmit}
      validateOnMount
      validateOnChange
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}

export default observer(Calculator)
