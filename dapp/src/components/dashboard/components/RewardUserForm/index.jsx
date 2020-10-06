import React, { Component } from 'react'
import classNames from 'classnames'
import { Formik } from 'formik'
import isEqual from 'lodash/isEqual'
import bonusesShape from 'utils/validation/shapes/bonuses'
import Options from './Option'

class RewardUserForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      ...this.props.initialValues
    }

    this.validationSchema = bonusesShape
  }

  onSubmit = (values, formikBag) => {
    const { initialValues } = this.props
    if (!isEqual(initialValues.joinBonus, values.joinBonus)) {
      this.props.setJoinBonus(values.joinBonus.amount, values.joinBonus.isActive)
    }
    if (!isEqual(initialValues.backupBonus, values.backupBonus)) {
      this.props.setBackupBonus(values.backupBonus.amount, values.backupBonus.isActive)
    }
    if (!isEqual(initialValues.inviteBonus, values.inviteBonus)) {
      this.props.setInviteBonus(values.inviteBonus.amount, values.inviteBonus.isActive)
    }
  }

  renderForm = ({ handleSubmit, values }) => {
    const { hasFunderBalance } = this.props
    return (
      <form
        onSubmit={handleSubmit}
        className={classNames('bonus_options__container',
          { 'bonus_options__container--opacity': !hasFunderBalance })}>
        <div className='bonus_options'>
          <Options
            hasFunderBalance={hasFunderBalance}
            values={values}
          />
        </div>
      </form>
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        onSubmit={this.onSubmit}
        enableReinitialize
        validateOnChange
      />
    )
  }
}

export default RewardUserForm
