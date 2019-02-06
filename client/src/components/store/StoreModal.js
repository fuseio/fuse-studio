import React from 'react'
import FontAwesome from 'react-fontawesome'
import Modal from 'components/Modal'

class StoreModal extends React.Component {
  onClose = () => {
    this.props.hideModal()
  }

  Capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  render () {
    return (
      <Modal onClose={this.onClose} className='appstore-modal'>
        <img className='appstore-modal-img' src={this.props.partner.image} />
        <h3 className='appstore-genre-title'>
          {this.props.partner.title}
        </h3>
        <p className='appstore-genre-author'>
          By <span>{this.props.partner.author}</span>
        </p>
        <div className='appstore-genre-category'>
          <FontAwesome name='dollar-sign' />
          {this.Capitalize(this.props.partner.category)}
        </div>
        <p className='appstore-genre-description text-left'>
          {this.props.partner.description}
        </p>
        <div className='text-left'>
          {Object.keys(this.props.partner.social).map((social, key) =>
            <div key={key} className='appstore-modal-social'>
              <a href={this.props.partner.social[social]} target='_blank'>
                <span className={`fab fa-${social}`} />
              </a>
            </div>
          )}
        </div>
      </Modal>
    )
  }
}

export default StoreModal
