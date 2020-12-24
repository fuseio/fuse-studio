import React from 'react'
import { Formik, Field } from 'formik'
import { object, boolean } from 'yup'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'
import { getIsMultiBridge } from 'selectors/dashboard'
import { toggleMultiBridge } from 'actions/bridge'
import { useSelector, useDispatch } from 'react-redux'

const Scheme = object().noUnknown(false).shape({
  isMultiBridge: boolean()
})

const ToggleBridge = (props) => {
  const isMultiBridge = useSelector(getIsMultiBridge)
  const dispatch = useDispatch()
  const renderForm = ({ values, handleSubmit, submitForm }) => {
    const { isMultiBridge } = values
    return (
      <form className='bridge_toggle' onSubmit={handleSubmit}>
        <Field name='isMultiBridge'>
          {({ field, form: { handleChange } }) => (
            <div className='grid-x align-middle'>
              <label className='toggle'>
                <input
                  {...field}
                  type='checkbox'
                  checked={isMultiBridge}
                  onChange={e => {
                    handleChange(e)
                    setTimeout(submitForm, 2)
                  }}
                />
                <div className='toggle-wrapper'>
                  <span className='toggle' />
                </div>
              </label>
              <div className='close_open_community__text'>
                <span>&nbsp;{isMultiBridge ? ' V2' : 'V1'}</span>
              </div>
              &nbsp;<FontAwesome style={{ fontSize: '60%' }} data-tip data-for='MultiBridge' name='info-circle' />
              <ReactTooltip className='tooltip__content' id='MultiBridge' place='bottom' effect='solid'>
                <div>New communities on Fuse use the V2 bridge by default. It is still possible to switch to the old bridge if your community is older.</div>
              </ReactTooltip>
            </div>
          )}
        </Field>

      </form>
    )
  }

  const onSubmit = (values, bag) => {
    dispatch(toggleMultiBridge(values.isMultiBridge))
  }

  return (
    <Formik
      initialValues={{ isMultiBridge }}
      onSubmit={onSubmit}
      validationSchema={Scheme}
      render={renderForm}
      initialStatus={false}
      validateOnChange
      validateOnMount
    />
  )
}

export default ToggleBridge
