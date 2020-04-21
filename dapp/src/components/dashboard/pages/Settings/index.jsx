import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { updateCommunityMetadata, setSecondaryToken } from 'actions/community'
import { getBalances, getAccountAddress } from 'selectors/accounts'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'
import SettingsForm from 'components/dashboard/components/SettingsForm'

const Settings = ({
  community,
  token,
  communityMetadata,
  setSecondaryToken,
  updateCommunityMetadata
}) => {
  return (
    <Fragment>
      <div className='settings__header'>
        <h2 className='settings__header__title'>Settings</h2>
      </div>
      <div>
        <div className='settings'>
          {
            token && communityMetadata && <SettingsForm
              community={community}
              communityMetadata={communityMetadata}
              token={token}
              updateCommunityMetadata={updateCommunityMetadata}
              setSecondaryToken={setSecondaryToken}
            />
          }
        </div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state, { community }) => ({
  ...state.screens.token,
  accountAddress: getAccountAddress(state),
  balances: getBalances(state),
  communityMetadata: community ? state.entities.metadata[community.communityURI] : {},
  token: getForeignTokenByCommunityAddress(state, getCommunityAddress(state))
})

const mapDispatchToProps = {
  updateCommunityMetadata,
  setSecondaryToken
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
