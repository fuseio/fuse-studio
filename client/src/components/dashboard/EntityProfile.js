import React, { Component } from 'react'
import { connect } from 'react-redux'
import MediaMobile from 'images/issue-popup-mobile.svg'
import FontAwesome from 'react-fontawesome'
import TopNav from './../TopNav'
import { getList, fetchBusinesses } from 'actions/directory'
import CustomCopyToClipboard from 'components/common/CustomCopyToClipboard'

class EntityProfile extends Component {
  state = {
    copyStatus: null
  }

  componentDidMount () {
    this.props.getList(this.props.match.params.address)
  }

  showHomePage = (address) => this.props.history.push('/')

  componentDidUpdate (prevProps) {
    if (this.props.listAddress && this.props.listAddress !== prevProps.listAddress) {
      this.props.fetchBusinesses(this.props.listAddress, 1)
    }
  }

  render () {
    const entity = this.props.metadata[`ipfs://${this.props.hash}`]
    return (
      <React.Fragment>
        <TopNav
          active
          history={this.props.history}
          showHomePage={this.showHomePage}
        />
        <div className={`entity-profile ${this.props.networkType}`}>
          <div className='entity-profile-container'>
            <div className='entity-profile-media'>
              <div className='entity-profile-media-img' style={{backgroundImage: `url(${MediaMobile})`}} />
              <div className='entity-profile-media-content'>
                <div className='entity-profile-logo'>
                  <FontAwesome name='bullseye' />
                </div>
                <div className='entity-profile-inform'>
                  <div>
                    {entity && entity.name &&
                      <h3 className='entity-profile-title'>{entity.name}</h3>}
                    {entity && entity.businessType &&
                      <p className='entity-profile-type'>{entity.businessType}</p>}
                  </div>
                  <div>
                    <p className='entity-profile-link'>
                      <FontAwesome name='edit' /> Edit business profile
                    </p>
                    <p className='entity-profile-link'>
                      <FontAwesome name='signature' /> Deactivate
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex between'>
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
                    <FontAwesome name='envelope' /><a href={`mailto:${entity.email}`}>{entity.email}</a>
                  </div>
                }
                {entity && entity.link &&
                  <div className='entity-profile-content-point'>
                    <FontAwesome name='home' /><a href={entity.link}>{entity.link}</a>
                  </div>
                }
              </div>
              <div className='entity-profile-content'>
                {entity && entity.description &&
                  <div className='entity-profile-content-point'>
                    {entity.description}
                  </div>
                }
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <div className='dashboard-information-footer entity-footer'>
                  <div className='dashboard-information-small-text'>
                    <span>Business Account</span>
                    <form>
                      <textarea
                        ref={textarea => (this.textArea = textarea)}
                        value={this.props.match.params.hash}
                        readOnly
                      />
                    </form>
                  </div>
                  <CustomCopyToClipboard text={this.props.match.params.hash}>
                    <p className='dashboard-information-period'>
                      <FontAwesome name='clone' />
                    </p>
                  </CustomCopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state, {match}) => ({
  hash: match.params.hash,
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  getList,
  fetchBusinesses
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityProfile)
