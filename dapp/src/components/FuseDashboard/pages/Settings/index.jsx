import React from 'react'
import SettingsForm from 'components/FuseDashboard/components/SettingsForm'

const Settings = () => {
  return (
    <>
      <div className='settings__header'>
        <h2 className='settings__header__title'>Settings</h2>
      </div>
      <div>
        <div className='settings'>
          <SettingsForm />
        </div>
      </div>
    </>
  )
}

export default Settings
