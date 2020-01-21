import React, { Fragment, Component } from 'react'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { Formik } from 'formik'
import { object, number, boolean } from 'yup'

class RewardUserForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      amount: '',
      ...this.props.initialValues
    }

    this.validationSchema = object().noUnknown(false).shape({
      amount: number().min(0),
      activated: boolean()
    })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.initialValues !== this.props.initialValues) {
      this.initialValues = {
        amount: '',
        ...this.props.initialValues
      }
    }
  }

  onSubmit = (values, formikBag) => {
    const { amount } = values
    const { setJoinBonus } = this.props
    setJoinBonus(amount)
    formikBag.resetForm({ amount })
  }

  renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const { amount } = values
    const { hasFunderBalance } = this.props

    return (
      <form onSubmit={handleSubmit} className={classNames('join_bonus__container', { 'join_bonus__container--opacity': !hasFunderBalance })}>
        <p className='join_bonus__title'>How much fuse tokens you want to reward new user community?</p>
        <div className='join_bonus__field'>
          <TextField
            type='number'
            name='amount'
            placeholder='00.00'
            onChange={handleChange}
            disabled={!hasFunderBalance}
            classes={{
              root: 'join_bonus__field'
            }}
            inputProps={{
              autoComplete: 'off',
              value: amount
            }}
            InputProps={{
              classes: {
                underline: 'join_bonus__field--underline',
                error: 'join_bonus__field--error'
              }
            }}
          />
        </div>
        <div className='join_bonus__actions'>
          <button className='button button--normal join_bonus__button' disabled={!hasFunderBalance || !isValid}>Save</button>
        </div>
      </form>
    )
  }

  render () {
    return (
      <Fragment>
        <h2 className='join_bonus__main-title join_bonus__main-title--dark'>Reward user</h2>
        <Formik
          initialValues={this.initialValues}
          validationSchema={this.validationSchema}
          render={this.renderForm}
          onSubmit={this.onSubmit}
          enableReinitialize
          validateOnChange
        />
      </Fragment>
    )
  }
}

export default RewardUserForm
