import React from 'react'
import Modal from 'components/common/Modal'
import RemoveIcon from 'images/remove.svg'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

const Content = ({ name, website }) => {
  if (!name || !website) return null
  return (
    <p className='plugin-info__text'>This plug-in inserts a link on the app menu that opens a page that allows users to top up their account using {name}. {name} allows you to accept credit/debit cards at a 4.5% per transaction. Get more info on the {name} website: <a target='_blank' rel='noopener noreferrer' href={website}>{website}</a></p>
  )
}

const PluginInfoModal = ({
  hideModal,
  coverImage,
  title,
  hasPlugin,
  disabled,
  managePlugin,
  pluginName,
  website,
  content
}) => {
  const handleClick = () => {
    managePlugin()
    hideModal()
  }

  return (
    <Modal whiteClose hasCloseBtn className='plugin-info' onClose={hideModal}>
      {coverImage && (
        <div className='plugin-info__image'>
          <div className='plugin-info__image__container'>
            <img src={coverImage} />
          </div>
        </div>
      )}
      <div className='plugin-info__content'>
        <h2 className='plugin-info__title'>{title}</h2>
        <Content name={pluginName} website={website} content={content} />
        {content && <p className='plugin-info__text'>{content}</p>}
        <button
          disabled={disabled}
          className={classNames('plugin-info__btn', { 'plugin-card__btn--add': !hasPlugin }, { 'plugin-card__btn--remove': hasPlugin })}
          onClick={handleClick}
        >
          {!hasPlugin ? (
            <React.Fragment>
              <FontAwesome name='plus-circle' style={{ color: 'white', marginRight: '5px' }} />
              <span>ADD</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <img src={RemoveIcon} />
              <span>Remove</span>
            </React.Fragment>
          )}
        </button>
      </div>
    </Modal>
  )
}

export default PluginInfoModal
