import React from 'react'
import { connect } from 'react-redux'
import TemplateItem from 'components/home/components/TemplateItem'
import FontAwesome from 'react-fontawesome'
import { CHOOSE_PROVIDER } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { push } from 'connected-react-router'
import templatesOptions from 'constants/templates'

const Templates = ({
  push,
  accountAddress,
  loadModal
}) => {
  const showIssuance = (path = '/view/issuance') => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      loadModal(CHOOSE_PROVIDER)
    } else {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed')
      }
      push(path)
    }
  }

  return (
    <div className='templates'>
      <div className='templates__title'>TEMPLATES</div>
      <div className='templates__list grid-x grid-margin-x grid-margin-y'>
        {templatesOptions.map((item, index) => {
          return <TemplateItem key={index} showIssuance={showIssuance} {...item} />
        })}
        <div onClick={showIssuance} className='item cell medium-12 small-24'>
          <div className='custom grid-y align-center align-middle'>
            <h6 className='custom__title'>Create a <br /> Custom Community</h6>
            <FontAwesome name='plus-circle' style={{ fontSize: '60px', color: '#c5d1d8' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress
})

const mapDispatchToProps = {
  push,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(Templates)
