import React from 'react'
import { connect } from 'react-redux'
import Plugin from 'components/dashboard/components/Plugin'
import JoinBonus from 'images/join_bonus.png'
import BusinessList from 'images/business_list.png'
import Bounty from 'images/bounty.png'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'

const PluginsItems = [
  {
    title: 'Business list',
    coverImage: BusinessList
  },
  {
    title: 'Join bonus',
    coverImage: JoinBonus
  },
  {
    title: 'Bounty',
    subTitle: ' | Coming soon!',
    coverImage: Bounty,
    disabled: true
  }
]

const Plugins = ({
  loadModal,
  ...props
}) => {
  const showInfoModal = (title, coverImage) => {
    loadModal(PLUGIN_INFO_MODAL, { title, coverImage })
  }

  return (
    <div className='plugins'>
      <h2 className='plugins__title'>Plugins</h2>
      <h2 className='plugins__content'>Plugins</h2>
      <div className='plugins__items'>
        {
          PluginsItems.map(({ title, coverImage, disabled, subTitle }) => {
            return (
              <Plugin
                showInfoModal={() => showInfoModal(title, coverImage)}
                key={title}
                subTitle={subTitle}
                disabled={disabled}
                title={title}
                image={coverImage}
              />
            )
          })
        }
      </div>
    </div>
  )
}

const mapStateToProps = () => ({

})

const mapDispatchToProps = {
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(Plugins)
