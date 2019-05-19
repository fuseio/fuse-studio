import React, { Component } from 'react'
import { connect } from 'react-redux'
import MediaMobile from 'images/issue-popup-mobile.svg'
import FontAwesome from 'react-fontawesome'
import TopNav from 'components/TopNav'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { loadModal } from 'actions/ui'
import { fetchMetadata } from 'actions/metadata'
import { editEntity, fetchEntity } from 'actions/communityEntities'
import { ADD_DIRECTORY_ENTITY, WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import ReactGA from 'services/ga'
import { getBlockExplorerUrl } from 'utils/network'
import { getTransaction } from 'selectors/transaction'

class EntityProfile extends Component {
  componentDidMount () {
    if (!this.props.entity) {
      this.props.fetchEntity(this.props.communityAddress, this.props.account)
    }
  }

  onlyOnFuse = (successFunc) => {
    if (this.props.networkType === 'fuse') {
      successFunc()
    } else {
      this.props.loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['fuse'] })
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

  showHomePage = (address) => this.props.history.push('/')

  handleEdit = () =>
    this.onlyOnFuse(() => this.props.loadModal(ADD_DIRECTORY_ENTITY, { submitEntity: this.editEntity, entity: this.props.entity }))

  render () {
    const { entity } = this.props
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
              <div className='entity-profile-media-img' style={{ backgroundImage: `url(${MediaMobile})` }} />
              <div className='entity-profile-media-content'>
                <div className='entity-profile-logo'>
                  <FontAwesome name='bullseye' />
                </div>
                <div className='entity-profile-inform'>
                  <div>
                    {entity && entity.name &&
                      <h3 className='entity-profile-title'>{entity.name}</h3>}
                    {entity && entity.type &&
                      <p className='entity-profile-type'>{entity.type}</p>}
                  </div>
                  <div className='entity-profile-actions'>
                    <p className='entity-profile-actions-edit' onClick={this.handleEdit}>
                      Edit page
                    </p>&nbsp;&nbsp;|&nbsp;&nbsp;
                    <div className='entity-profile-actions-toggle'>
                      <input type='checkbox' value={entity && entity.active} checked={entity && entity.active} onChange={(e) => this.toggleHandler(e.target.checked)} />
                      <div className='toggle-wrapper'><span className='toggle' /></div>
                    </div>
                    <div className='entity-profile-actions-status'>
                      {
                        entity && entity.active
                          ? <span>Activate</span>
                          : <span>Deactivate</span>
                      }
                    </div>
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
                {entity && entity.websiteUrl &&
                  <div className='entity-profile-content-point'>
                    <FontAwesome name='home' /><a style={{ textDecoration: 'underline' }} href={entity.websiteUrl}>{entity.websiteUrl}</a>
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
                  {this.props.entity && this.props.entity.account &&
                    <div className='dashboard-information-small-text'>
                      <span className='text-asset'>Account ID</span>
                      <a href={`${getBlockExplorerUrl('fuse')}/address/${this.props.entity.account}`} target='_blank'>
                        <span className='id'>{this.props.entity.account}</span></a>
                      <CopyToClipboard text={this.props.entity.account}>
                        <p className='dashboard-information-period'>
                          <FontAwesome name='clone' />
                        </p>
                      </CopyToClipboard>
                    </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state, { match }) => ({
  communityAddress: match.params.communityAddress,
  account: match.params.account,
  entity: state.entities.communityEntities[match.params.account] &&
    state.entities.communityEntities[match.params.account].uri &&
    state.entities.metadata[state.entities.communityEntities[match.params.account].uri],
  editEntityReceipt: state.screens.communityEntities.editEntityReceipt,
  ...getTransaction(state, state.screens.communityEntities.editTransactionHash)
})

const mapDispatchToProps = {
  loadModal,
  editEntity,
  fetchMetadata,
  fetchEntity
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityProfile)
