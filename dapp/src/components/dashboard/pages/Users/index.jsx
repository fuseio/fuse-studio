import React, { Component, Fragment, useEffect } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Loader from 'components/Loader'
import { getClnBalance, getAccountAddress } from 'selectors/accounts'
import { REQUEST, PENDING } from 'actions/constants'
import { getUsersEntities, checkIsAdmin } from 'selectors/entities'
import plusIcon from 'images/add.svg'
import {
  addEntity,
  fetchUsersEntities,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  confirmUser,
  toggleCommunityMode
} from 'actions/communityEntities'
import { fetchCommunity } from 'actions/token'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_USER_MODAL } from 'constants/uiConstants'
import ReactGA from 'services/ga'
import { isOwner } from 'utils/token'
import { getTransaction } from 'selectors/transaction'
import Entity from '../../components/Entity'

const filterOptions = [
  {
    label: 'Community users',
    value: 'isApproved'
  },
  {
    label: 'Pending users',
    value: 'pending'
  },
  {
    label: 'Community admins',
    value: 'isAdmin'
  }
]

const UsersDataFetcher = (props) => {
  useEffect(() => {
    if (props.toggleSuccess) {
      props.fetchCommunity(props.communityAddress)
    }
  }, [props.toggleSuccess])

  useEffect(() => {
    if (props.toggleSuccess) {
      props.fetchCommunity(props.foreignTokenAddress)
    }
  }, [props.toggleSuccess])

  useEffect(() => {
    if (props.communityAddress) {
      props.fetchUsersEntities(props.communityAddress)
    }
  }, [props.communityAddress])

  return null
}

class Users extends Component {
  state = {
    search: '',
    filters: {
      pending: false,
      isApproved: true,
      isAdmin: false
    }
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

  handleAddUser = () => {
    this.props.onlyOnFuse(this.loadAddUserModal)
  }

  loadAddUserModal = () => {
    const { loadModal } = this.props
    loadModal(ADD_USER_MODAL, {
      submitEntity: (data) => this.props.addEntity(this.props.community.communityAddress, { ...data, type: 'user' }, this.props.isClosed)
    })
  }

  renderTransactionStatus = () => {
    if (this.props.signatureNeeded || this.props.transactionStatus === PENDING || this.props.fetchEntities) {
      return (
        <div className='entities__loader'>
          <Loader color='#3a3269' className='loader' />
        </div>
      )
    }
  }

  handleRadioInput = (e) => {
    const filters = {
      pending: false,
      isApproved: false,
      isAdmin: false
    }
    this.setState({ filters: { ...filters, [e.target.value]: true } })
  }

  setSearchValue = (e) => this.setState({ search: e.target.value })

  filterBySearch = (search, entities) =>
    search ? entities.filter(entity =>
      entity && entity.name && entity.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : entities

  filterByRadio = (users) => {
    const { filters } = this.state
    const val = Object.keys(filters).find((key) => filters[key])
    return users.filter((user) => this.getFilter(val, user))
  }

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

  handleConfirmUser = (account) => {
    const { confirmUser, onlyOnFuse } = this.props
    onlyOnFuse(() => confirmUser(account))
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
      return <p className='entities__items__empty'>There are no any entities</p>
    }
  }

  renderItems = () => {
    const { transactionStatus, users } = this.props
    const { filters } = this.state

    const filteredItems = this.filterBySearch(this.state.search, users)
    const val = Object.keys(filters).find((key) => filters[key])

    if (users && users.length) {
      return (
        <Fragment>
          <div className='entities__search entities__search--user'>
            {
              // showUsers && isAdmin &&
              (
                <div className='entities__search__filter entities__search__filter--border'>
                  <div className='entities__search__filter__value'>
                    <span>&nbsp;&nbsp;Filter&nbsp;&nbsp;</span>
                    <span className='selected'>{filterOptions.find(({ value }) => val === value).label}</span>
                  </div>
                  <div className='filter-options'>
                    <ul className='options'>
                      {
                        filterOptions
                          .map(({ label, value }) =>
                            <li key={value} className='options__item'>
                              <label>{label}
                                <input
                                  type='radio'
                                  name='filter'
                                  checked={filters[value]}
                                  value={value}
                                  onChange={this.handleRadioInput}
                                />
                                <span />
                              </label>
                            </li>
                          )
                      }
                    </ul>
                  </div>
                </div>
              )
            }
            <button className='entities__search__icon' onClick={() => this.setShowingSearch()}>
              <FontAwesome name='search' />
            </button>
            <input
              value={this.state.search}
              onChange={this.setSearchValue}
              placeholder='Search a user...'
            />
          </div>
          {this.renderTransactionStatus()}
          {this.renderList(filteredItems)}
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          {this.renderTransactionStatus()}
          <div className='entities__empty-list'>
            <div className='entities__empty-list__title'>Kinda sad in here, isn’t it?</div>
            <div className='entities__empty-list__text'>You can keep watching Netflix later, add a user and let’s start Rock’n’Roll!</div>
            <button
              className='entities__empty-list__btn'
              onClick={this.handleAddUser}
              disabled={transactionStatus === REQUEST || transactionStatus === PENDING}
            >
              Add new user
            </button>
          </div>
        </Fragment>
      )
    }
  }

  canDeployBusinessList = () => !this.props.signatureNeeded &&
    isOwner(this.props.token, this.props.accountAddress) &&
    this.props.community.homeTokenAddress

  getFilter (val, user) {
    return val === 'isApproved' ? user.isApproved : val === 'pending' ? !user.isApproved : user.isAdmin
  }

  render () {
    const {
      community,
      isAdmin,
      fetchCommunity,
      fetchUsersEntities,
      toggleSuccess,
      networkType
    } = this.props
    const {
      communityAddress,
      homeTokenAddress,
      foreignTokenAddress
    } = community

    return (
      <Fragment>
        <div className='entities__header'>
          <h2 className='entities__header__title'>Users list</h2>
          {
            isAdmin && (
              <div className='entities__header__add'>
                {
                  networkType === 'fuse'
                    ? (
                      <span onClick={this.handleAddUser}>
                        <a style={{ backgroundImage: `url(${plusIcon})` }} />
                      </span>
                    ) : (
                      <span onClick={this.handleAddUser}>
                        <FontAwesome name='plus-circle' />
                      </span>
                    )
                }
                Add new user
              </div>
            )
          }
        </div>
        <div className='entities__wrapper'>
          <div className='entities__container'>
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

          <UsersDataFetcher
            communityAddress={communityAddress}
            homeTokenAddress={homeTokenAddress}
            foreignTokenAddress={foreignTokenAddress}
            fetchCommunity={fetchCommunity}
            fetchUsersEntities={fetchUsersEntities}
            toggleSuccess={toggleSuccess}
          />
        </div>
      </Fragment >
    )
  }
}

const mapStateToProps = (state) => ({
  network: state.network,
  users: getUsersEntities(state),
  clnBalance: getClnBalance(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  isAdmin: checkIsAdmin(state),
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  addEntity,
  confirmUser,
  addAdminRole,
  removeAdminRole,
  removeEntity,
  loadModal,
  hideModal,
  fetchCommunity,
  fetchUsersEntities,
  toggleCommunityMode
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
