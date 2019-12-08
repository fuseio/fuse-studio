import React, { Fragment, Component } from 'react'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { Formik } from 'formik'
import { object, string, number, boolean } from 'yup'

class RewardUserForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      message: '',
      amount: '',
      ...this.props.initialValues
    }

    this.validationSchema = object().noUnknown(false).shape({
      message: string().normalize(),
      amount: number().positive(),
      activated: boolean()
    })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.initialValues !== this.props.initialValues) {
      this.initialValues = {
        message: '',
        amount: '',
        ...this.props.initialValues
      }
    }
  }

  onSubmit = (values) => {
    const { amount, message } = values
    const { addCommunityPlugin, communityAddress } = this.props
    addCommunityPlugin(communityAddress, { name: 'joinBonus', joinInfo: { message, amount: amount.toString() } })
  }

  renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const { amount, message, activated } = values
    const { toggleJoinBonus, hasFunderBalance } = this.props

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
        <div style={{ marginTop: '2em' }}>
          <p className='join_bonus__title'>A message that goes along with it</p>
          <div className='join_bonus__field'>
            <TextField
              type='text'
              onChange={handleChange}
              disabled={!hasFunderBalance}
              name='message'
              classes={{
                root: 'join_bonus__field'
              }}
              inputProps={{
                autoComplete: 'off',
                value: message
              }}
              InputProps={{
                classes: {
                  underline: 'join_bonus__field--underline',
                  error: 'join_bonus__field--error'
                }
              }}
            />
          </div>
        </div>
        <div className='join_bonus__actions'>
          <div className='content__toggle'>
            <label className='toggle'>
              <input
                disabled={!hasFunderBalance}
                type='checkbox'
                checked={activated}
                defaultValue={activated}
                onChange={() => toggleJoinBonus(!activated)}
              />
              <div className='toggle-wrapper'>
                <span className='toggle' />
              </div>
            </label>
            <div className='content__toggle__text'>
              <span>{!activated ? 'Activate' : 'Deactivate'}</span>
            </div>
          </div>
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
