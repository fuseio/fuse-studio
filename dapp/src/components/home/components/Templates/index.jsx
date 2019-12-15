import React, { Fragment } from 'react'
import TemplateItem from 'components/home/components/TemplateItem'
import PlusIcon from 'images/plug_icon.svg'
import classNames from 'classnames'
import templatesOptions from 'constants/templates'

const Templates = ({
  showIssuance,
  children,
  title = 'TEMPLATES',
  withDecoration = false
}) => {
  return (
    <div className={classNames('templates', { 'templates__decoration': withDecoration })}>
      {withDecoration && <div className='templates__title'>{title}</div>}
      <div className='templates__list grid-x grid-margin-x grid-margin-y'>
        {
          children || (
            <Fragment>
              {templatesOptions.map((item) => {
                const { title } = item
                return <TemplateItem key={title} showIssuance={showIssuance} {...item} />
              })}
              <div onClick={() => {
                window.analytics.track('Create a custom community clicked')
                showIssuance()
              }} className='item cell medium-12 small-24'>
                <div className='custom grid-y align-center align-middle'>
                  <h6 className='custom__title'>Create a <br /> Custom Community</h6>
                  <img src={PlusIcon} />
                </div>
              </div>
            </Fragment>
          )
        }
      </div>
    </div>
  )
}

export default Templates
