import React, { memo } from 'react'
import { connect, Field, getIn } from 'formik'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'
import pluginsIcons from 'constants/pluginsIcons'

const PluginItem = memo(({ pluginName, isActive }) => {
  return (
    <div className='plugins_step__item grid-x align-middle cell small-24 medium-12'>
      <img src={pluginsIcons[pluginName]} style={{ width: '15px', height: '15px', marginRight: '10px' }} />
      <div className='plugins_step__title'>{upperFirst(lowerCase(upperCase(pluginName)))}</div>
      <Field
        name='isOpen'
        render={({ field, form: { setFieldValue } }) => (
          <label className='toggle'>
            <input
              {...field}
              type='checkbox'
              name={`plugins.${pluginName}.isActive`}
              checked={isActive}
              onChange={e => {
                setFieldValue(`plugins.${pluginName}.isActive`, e.target.checked)
              }}
            />
            <div className='toggle-wrapper'>
              <span className='toggle' />
            </div>
          </label>
        )}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.pluginName !== nextProps.pluginName) {
    return false
  } else if (prevProps.isActive !== nextProps.isActive) {
    return false
  }

  return true
})

const Plugins = ({
  formik
}) => {
  const plugins = getIn(formik.values, 'plugins')
  const keys = React.useMemo(() => {
    return Object.keys(plugins)
  }, [])

  return (
    <div className='grid-x grid-margin-x grid-margin-y plugins_step'>
      {keys.map((pluginName, index) => <PluginItem key={index} pluginName={pluginName} isActive={plugins[pluginName].isActive} />)}
    </div>
  )
}

export default connect(Plugins)
