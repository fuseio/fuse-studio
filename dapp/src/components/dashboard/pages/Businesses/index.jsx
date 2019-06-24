import React, { Component, Fragment, useEffect } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Loader from 'components/common/Loader'
import { getClnBalance, getAccountAddress } from 'selectors/accounts'
import { REQUEST, PENDING } from 'actions/constants'
import { getBusinessesEntities } from 'selectors/entities'
import {
  addEntity,
  fetchBusinessesEntities,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  toggleCommunityMode
} from 'actions/communityEntities'
import { fetchCommunity } from 'actions/token'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_DIRECTORY_ENTITY } from 'constants/uiConstants'
import ReactGA from 'services/ga'
import { isOwner } from 'utils/token'
import plusIcon from 'images/add.svg'
import { getTransaction } from 'selectors/transaction'
import Entity from '../../components/Entity'
import isEmpty from 'lodash/isEmpty'

const BusinessesDataFetcher = (props) => {
  useEffect(() => {
    if (props.toggleSuccess) {
      props.fetchCommunity(props.communityAddress)
    }
  }, [props.toggleSuccess])

  useEffect(() => {
    if (props.communityAddress) {
      props.fetchBusinessesEntities(props.communityAddress)
    }
  }, [props.communityAddress])

  return null
}

class Businesses extends Component {
  state = {
    search: ''
  }

  showHomePage = (address) => {
    this.props.history.push('/')
  }

  showProfile = (address, hash) => {
    this.props.history.push(`/view/directory/${address}/${hash}`)
    ReactGA.event({
      category: 'Directory',
      action: 'Click',
      label: 'directory'
    })
  }

  handleAddBusiness = () => {
    this.props.onlyOnFuse(this.loadAddingModal)
  }

  loadAddingModal = () => this.props.loadModal(ADD_DIRECTORY_ENTITY, {
    submitEntity: (data) => this.props.addEntity(this.props.community.communityAddress, { ...data, type: 'business' }, this.props.community.isClosed)
  })

  renderTransactionStatus = () => {
    if (this.props.signatureNeeded || this.props.transactionStatus === PENDING || this.props.fetchEntities) {
      return (
        <div className='entities__loader'>
          <Loader color='#3a3269' className='loader' />
        </div>
      )
    }
  }

  setSearchValue = (e) => this.setState({ search: e.target.value })

  filterBySearch = (search, entities) =>
    search ? entities.filter(entity =>
      entity && entity.name && entity.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : entities

  handleRemoveEntity = (account) => {
    const { removeEntity, community: { communityAddress }, onlyOnFuse } = this.props
    onlyOnFuse(() => removeEntity(communityAddress, account))
  }

  handleAddAdminRole = (account) => {
    const { addAdminRole, onlyOnFuse } = this.props
    onlyOnFuse(() => addAdminRole(account))
  }

  handleRemoveAdminRole = (account) => {
    const { removeAdminRole, onlyOnFuse } = this.props
    onlyOnFuse(() => removeAdminRole(account))
  }

  handleToggleCommunityMode = (event) => {
    const isClosed = event.target.checked
    const { community: { communityAddress }, toggleCommunityMode, onlyOnFuse } = this.props
    onlyOnFuse(() => toggleCommunityMode(communityAddress, isClosed))
  }

  renderList = (entities) => {
    const { metadata, isAdmin, community: { communityAddress, homeTokenAddress } } = this.props

    if (entities.length) {
      return (
        entities.map((entity, index) =>
          <Entity
            key={index}
            index={index}
            entity={entity}
            address={homeTokenAddress}
            addAdminRole={this.handleAddAdminRole}
            removeAdminRole={this.handleRemoveAdminRole}
            handleRemove={this.handleRemoveEntity}
            confirmUser={this.handleConfirmUser}
            isAdmin={isAdmin}
            metadata={metadata[entity.uri]}
            showProfile={() => this.showProfile(communityAddress, entity.account)}
          />
        ))
    } else {
      return <p className='entities__empty-list__title'>No entities found</p>
    }
  }

  renderItems = () => {
    const { transactionStatus, businesses } = this.props

    const filteredItems = this.filterBySearch(this.state.search, businesses)

    if (businesses && businesses.length) {
      return (
        <Fragment>
         
          {this.renderTransactionStatus()}
          {this.renderList(filteredItems)}
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          {this.renderTransactionStatus()}
          <div className='entities__empty-list'>
            <div className='entities__empty-list__title'>Your list is empty - Start to fill it</div>
            <div className='entities__empty-list__text' />
            <button
              className='entities__empty-list__btn'
              onClick={this.handleAddBusiness}
              disabled={transactionStatus === REQUEST || transactionStatus === PENDING}
            >
              Add new merchant
            </button>
          </div>
        </Fragment>
      )
    }
  }

  canDeployBusinessList = () => !this.props.signatureNeeded &&
    isOwner(this.props.token, this.props.accountAddress) &&
    this.props.community.homeTokenAddress

  render () {
    const {
      community,
      isAdmin,
      fetchCommunity,
      fetchBusinessesEntities,
      toggleSuccess,
      businesses
    } = this.props
    const {
      communityAddress,
      homeTokenAddress,
      foreignTokenAddress
    } = community

    return (
      <Fragment>
        <div className='entities__header'>
          <h2 className='entities__header__title'>Businesses list</h2>
          {
            isAdmin && (
              <div className='entities__header__add grid-x align-middle'>
                <span onClick={this.handleAddBusiness}>
                  <a style={{ backgroundImage: `url(${plusIcon})` }} />
                </span>
                Add new merchant
              </div>
            )
          }
        </div>
        <div className='entities__wrapper'>
          <div className='entities__container'>
            {
              !isEmpty(businesses) && (
                <div className='entities__search entities__search--business'>
                  <button className='entities__search__icon'>
                    <FontAwesome name='search' />
                  </button>
                  <input
                    value={this.state.search}
                    onChange={this.setSearchValue}
                    placeholder='Search a merchant...'
                  />
                </div>
              )
            }
            {
              communityAddress && (
                <Fragment>
                  <div className='entities__items'>
                    {this.renderItems()}
                  </div>
                </Fragment>
              )
            }

          </div>

          <BusinessesDataFetcher
            communityAddress={communityAddress}
            homeTokenAddress={homeTokenAddress}
            foreignTokenAddress={foreignTokenAddress}
            fetchCommunity={fetchCommunity}
            fetchBusinessesEntities={fetchBusinessesEntities}
            toggleSuccess={toggleSuccess}
          />
        </div>
      </Fragment >
    )
  }
}

const mapStateToProps = (state) => ({
  network: state.network,
  businesses: getBusinessesEntities(state),
  clnBalance: getClnBalance(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  addEntity,
  addAdminRole,
  removeAdminRole,
  removeEntity,
  loadModal,
  hideModal,
  fetchCommunity,
  fetchBusinessesEntities,
  toggleCommunityMode
}

export default connect(mapStateToProps, mapDispatchToProps)(Businesses)
