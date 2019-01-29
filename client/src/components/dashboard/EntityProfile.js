import React, { Component } from 'react'
import { connect } from 'react-redux'
import MediaMobile from 'images/issue-popup-mobile.svg'
import FontAwesome from 'react-fontawesome'
import {getEntities} from 'selectors/directory'

class EntityProfile extends Component {
  state = {
    copyStatus: null,
    keyHash: ''
  }
  copyToClipboard = (e) => {
    this.textArea.select()
    document.execCommand('copy')
    e.target.focus()
    this.setState({copyStatus: 'Copied!'})
    setTimeout(() => {
      this.setState({copyStatus: ''})
    }, 2000)
    this.textArea.value = ''
    this.textArea.value = this.props.match.params.hash
  };
  render () {
    const keyHash = Object.keys(this.props.listHashes).filter(hash => {
      if (this.props.match.params.hash === this.props.listHashes[hash]) {
        return hash
      }
    })
    const entity = Object.keys(this.props.entities).length ? this.props.entities[keyHash[0]] : null
    return (
      <div className='entity-profile'>
        <div className='entity-profile-container'>
          <div className='row'>
            <div className='col-6'>
              <div className='entity-profile-media'>
                <div className='entity-profile-media-img' style={{backgroundImage: `url(${MediaMobile})`}} />
                <div className='entity-profile-media-content'>
                  <div className='entity-profile-logo'>
                    <FontAwesome name='bullseye' />
                  </div>
                  {entity && entity.name &&
                    <h3 className='entity-profile-title'>{entity.name}</h3>}
                  {entity && entity.businessType &&
                    <p className='entity-profile-type'>{entity.businessType}</p>}
                  <p className='entity-profile-link'>Edit business profile</p>
                </div>
              </div>
            </div>
            <div className='col-6'>
              <div className='entity-profile-content'>
                {entity && entity.address &&
                  <div className='entity-profile-content-point'>
                    <FontAwesome name='map-marker-alt' /> {entity.address}
                  </div>
                }
                {entity && entity.phone &&
                  <div className='entity-profile-content-point'>
                    <FontAwesome name='phone' /> {entity.phone}
                  </div>
                }
                {entity && entity.email &&
                  <div className='entity-profile-content-point'>
                    <a href={`mailto:${entity.email}`} ><FontAwesome name='envelope' /> {entity.email}</a>
                  </div>
                }
                {entity && entity.link &&
                  <div className='entity-profile-content-point'>
                    <FontAwesome name='home' /> {entity.link}
                  </div>
                }
              </div>
              {entity && entity.description &&
                <div className='entity-profile-content'>
                  <div className='entity-profile-content-point'>
                    {entity.description}
                  </div>
                </div>
              }
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <div className='dashboard-information-footer entity-footer'>
                <div className='dashboard-information-small-text'>
                  <span>Public key</span>
                  <form>
                    <textarea
                      ref={textarea => (this.textArea = textarea)}
                      value={this.props.match.params.hash}
                      readOnly
                    />
                  </form>
                </div>
                {document.queryCommandSupported('copy') &&
                  <p className='dashboard-information-period' onClick={this.copyToClipboard}>
                    copy
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
        {this.state.copyStatus && <div className='dashboard-notification'>
          {this.state.copyStatus}
        </div>
        }}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  entities: getEntities(state),
  listHashes: state.screens.directory.listHashes
})

export default connect(mapStateToProps, null)(EntityProfile)
