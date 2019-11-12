import React from 'react'
import { connect } from 'react-redux'
import capitalize from 'lodash/capitalize'
import { addCommunityPlugin } from 'actions/community'
import OnRampForm from 'components/dashboard/components/OnRampForm'

const OnRamp = ({
  plugin,
  community,
  addCommunityPlugin
}) => {
  return (
    <div className='join_bonus__wrapper'>
      <div className='join_bonus'>
        <h2 className='join_bonus__main-title join_bonus__main-title--white'>On-Ramp with {capitalize(plugin.name)}</h2>
        <div style={{ position: 'relative' }}>
          <OnRampForm
            initialValues={plugin}
            plugin={plugin}
            communityAddress={community.communityAddress}
            addCommunityPlugin={addCommunityPlugin}
          />
        </div>
      </div>
    </div>
  )
}

const mapDispatchToState = {
  addCommunityPlugin
}

export default connect(null, mapDispatchToState)(OnRamp)
