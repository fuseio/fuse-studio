import React, { Fragment } from 'react'
import { connect, useSelector } from 'react-redux'
import { updateCommunityMetadata, setSecondaryToken } from 'actions/community'
// import { getBalances, getAccountAddress } from 'selectors/accounts'
// import { getForeignTokenByCommunityAddress } from 'selectors/token'
// import { getCommunityAddress } from 'selectors/entities'
import SettingsForm from 'components/FuseDashboard/components/SettingsForm'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'

const Settings = ({
  setSecondaryToken,
  updateCommunityMetadata
}) => {
  const { dashboard } = useStore()
  const { community, homeToken: token } = dashboard
  const communityURI = dashboard?.community?.communityURI
  const communityMetadata = useSelector(state => state.entities.metadata[communityURI])
  return (
    <>
      <div className='settings__header'>
        <h2 className='settings__header__title'>Settings</h2>
      </div>
      <div>
        <div className='settings'>
          {token && communityMetadata && (
            <SettingsForm
              community={{ ...community }}
              communityMetadata={communityMetadata}
              token={{ ...token }}
              updateCommunityMetadata={updateCommunityMetadata}
              setSecondaryToken={setSecondaryToken}
            />
          )}
        </div>
      </div>
    </>
  )
}

const mapDispatchToProps = {
  updateCommunityMetadata,
  setSecondaryToken
}

export default connect(null, mapDispatchToProps)(observer(Settings))

// export default observer(Settings)
