import React from 'react'
import TemplateItem from 'components/home/components/TemplateItem'
import FontAwesome from 'react-fontawesome'
import templatesOptions from 'constants/templates'

const Templates = ({
  showIssuance,
  setPath
}) => {
  return (
    <div className='templates'>
      <div className='templates__title'>TEMPLATES</div>
      <div className='templates__list grid-x grid-margin-x grid-margin-y'>
        {templatesOptions.map((item, index) => {
          return <TemplateItem setPath={setPath} key={index} showIssuance={showIssuance} {...item} />
        })}
        <div onClick={() => {
          setPath('/view/issuance')
          window.analytics.track('Create a custom community clicked')
          showIssuance()
        }} className='item cell medium-12 small-24'>
          <div className='custom grid-y align-center align-middle'>
            <h6 className='custom__title'>Create a <br /> Custom Community</h6>
            <FontAwesome name='plus-circle' style={{ fontSize: '60px', color: '#c5d1d8' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
