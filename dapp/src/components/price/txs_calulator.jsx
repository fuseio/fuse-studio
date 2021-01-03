import React from 'react'
import InfoIcon from 'images/information.svg'
import { Formik, Form, Field } from 'formik'
import { number, object } from 'yup'
import Slider from '@material-ui/core/Slider'
import { withStyles } from '@material-ui/styles'

const AirbnbSlider = withStyles({
  root: {
    color: '#0F273C',
    height: 3,
    padding: '13px 0'
  },
  thumb: {
    height: 32,
    width: 32,
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

function AirbnbThumbComponent (props) {
  return (
    <span {...props}>
      <span className='bar' />
      <span className='bar' />
      <span className='bar' />
    </span>
  )
}

function Calculator () {
  const renderForm = ({ values, isValid, isSubmitting }) => {
    const { transaction } = values
    const cost = transaction * 0.000003
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
          <Field
            name='transaction'
          >
            {({ field, form }) => {
              console.log({ field })
              return (
                <AirbnbSlider
                  min={1000}
                  ThumbComponent={AirbnbThumbComponent}
                  max={1000000}
                  value={values.transaction}
                  step={1}
                  defaultValue={1000}
                  aria-labelledby='non-linear-slider'
                  onChange={(e, value) => {
                    form.setFieldValue('transaction', value)
                  }}
                />
              )
            }}
          </Field>
          <div className='section__two__box'>
            <span className='cost'>COST</span>
            <div className='content'>
              {cost} <span>FUSE</span>
              {/* <small>(<span>$</span>0.0003608)</small> */}
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
    // console.log({ values })
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

export default Calculator
