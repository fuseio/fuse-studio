import React, { Component } from 'react'
import { connect } from 'react-redux'
import MediaMobile from 'images/issue-popup-mobile.svg'
import FontAwesome from 'react-fontawesome'
import TopNav from 'components/TopNav'
import {loadModal} from 'actions/ui'
import { getList, fetchBusinesses, fetchBusiness, activateBusiness, deactivateBusiness, editEntity } from 'actions/directory'
import CustomCopyToClipboard from 'components/common/CustomCopyToClipboard'
import { ADD_DIRECTORY_ENTITY, WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import ReactGA from 'services/ga'

class EntityProfile extends Component {
  state = {
    copyStatus: null
  }

  componentDidMount () {
    if (!this.props.entity) {
      this.props.fetchBusiness(this.props.listAddress, this.props.hash)
    }
  }

  onlyOnFuse = (successFunc) => {
    if (this.props.networkType === 'fuse') {
      successFunc()
    } else {
      this.props.loadModal(WRONG_NETWORK_MODAL, {supportedNetworks: ['fuse']})
    }
  }

  showProfile = (address, hash) => {
    this.props.history.push(`/view/directory/${address}/${hash}`)
    ReactGA.event({
      category: 'Directory',
      action: 'Click',
      label: 'directory'
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.editEntityReceipt && !prevProps.editEntityReceipt) {
      const {newHash} = this.props.editEntityReceipt.events.EntityReplaced.returnValues
      this.showProfile(this.props.listAddress, newHash)
    }

    if (this.props.hash !== prevProps.hash) {
      this.props.fetchBusiness(this.props.listAddress, this.props.hash)
    }
  }

  showHomePage = (address) => this.props.history.push('/')

  handleDeactivate = () => this.onlyOnFuse(() => this.props.deactivateBusiness(this.props.listAddress, this.props.hash))

  handleActivate = () => this.onlyOnFuse(() => this.props.activateBusiness(this.props.listAddress, this.props.hash))

  handleEdit = () =>
    this.onlyOnFuse(() => this.props.loadModal(ADD_DIRECTORY_ENTITY, {submitEntity: this.editEntity, entity: this.props.entity}))

  editEntity = (data) => this.props.editEntity(this.props.listAddress, this.props.hash, data)

  render () {
    const {entity} = this.props
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
                    <p className='entity-profile-link' onClick={this.handleEdit}>
                      <FontAwesome name='edit' /> Edit business profile
                    </p>
                    {entity && entity.active
                      ? <p className='entity-profile-link' onClick={this.handleDeactivate}>
                        <FontAwesome name='signature' />
                        Deactivate
                      </p>
                      : <p className='entity-profile-link' onClick={this.handleActivate}>
                        <FontAwesome name='signature' />
                        Activate
                      </p>
                    }
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
                        value={this.props.hash}
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
  listAddress: match.params.listAddress,
  hash: match.params.hash,
  entity: state.entities.metadata[`ipfs://${match.params.hash}`],
  editEntityReceipt: state.screens.directory.editEntityReceipt
})

const mapDispatchToProps = {
  loadModal,
  getList,
  fetchBusinesses,
  fetchBusiness,
  activateBusiness,
  deactivateBusiness,
  editEntity
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityProfile)
