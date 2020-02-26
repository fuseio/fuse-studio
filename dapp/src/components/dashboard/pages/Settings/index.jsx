import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { updateCommunityMetadata } from 'actions/community'
import { getBalances, getAccountAddress } from 'selectors/accounts'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'
import SettingsForm from 'components/dashboard/components/SettingsForm'

const Settings = ({
  community,
  token,
  communityMetadata,
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
  communityMetadata: state.entities.metadata[community.communityURI],
  token: getForeignTokenByCommunityAddress(state, getCommunityAddress(state))
})

const mapDispatchToProps = {
  updateCommunityMetadata
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
