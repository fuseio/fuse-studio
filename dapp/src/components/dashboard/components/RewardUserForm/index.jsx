import React from 'react'
import classNames from 'classnames'
import { Formik } from 'formik'
import isEqual from 'lodash/isEqual'
import bonusesShape from 'utils/validation/shapes/bonuses'
import Options from './Option'

const RewardUserForm = ({ initialValues, setJoinBonus, setBackupBonus, setInviteBonus, hasFunderBalance }) => {
  const onSubmit = (values, formikBag) => {
    if (!isEqual((initialValues && initialValues.joinBonus), values.joinBonus)) {
      setJoinBonus(values.joinBonus.amount, values.joinBonus.isActive)
    }
    if (!isEqual((initialValues && initialValues.backupBonus), values.backupBonus)) {
      setBackupBonus(values.backupBonus.amount, values.backupBonus.isActive)
    }
    if (!isEqual((initialValues && initialValues.inviteBonus), values.inviteBonus)) {
      setInviteBonus(values.inviteBonus.amount, values.inviteBonus.isActive)
    }
  }

  console.log({
    ...initialValues
  })
  return (
    <Formik
      initialValues={{
        ...initialValues
      }}
      validationSchema={bonusesShape}
      render={({ handleSubmit, values }) => {
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
      }}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
    />
  )
}

export default RewardUserForm
