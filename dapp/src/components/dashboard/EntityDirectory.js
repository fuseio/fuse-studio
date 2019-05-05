import React, { Component, useEffect } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Loader from 'components/Loader'
import { getClnBalance, getAccountAddress } from 'selectors/accounts'
import { REQUEST, PENDING, SUCCESS } from 'actions/constants'
import { getEntities } from 'selectors/directory'
import { getList, addEntity, fetchBusinesses } from 'actions/directory'
import Entity from './Entity'
import EmptyBusinessList from 'images/emptyBusinessList.png'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_DIRECTORY_ENTITY } from 'constants/uiConstants'
import ReactGA from 'services/ga'
import { isOwner } from 'utils/token'
import { fetchHomeToken } from 'actions/bridge'
import plusIcon from 'images/add.svg'
import { getTransaction } from 'selectors/transaction'

const EntityDirectoryDataFetcher = (props) => {
  useEffect(() => {
    if (props.homeTokenAddress) {
      props.getList(props.homeTokenAddress)
    } else {
      props.fetchHomeToken(props.foreignTokenAddress)
    }
  }, [props.homeTokenAddress])

  useEffect(() => {
    if (props.listAddress) {
      props.fetchBusinesses(props.listAddress, 1)
    }
  }, [props.listAddress])

  useEffect(() => {
    if (props.listAddress && props.transactionStatus === SUCCESS) {
      props.fetchBusinesses(props.listAddress, 1)
    }
  }, [props.transactionStatus])

  return null
}

class EntityDirectory extends Component {
  state = {
    showSearch: false,
    search: ''
  }
  setQuitDashboard = () => this.props.history.goBack()

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
    submitEntity: (data) => this.props.addEntity(this.props.listAddress, { ...data, active: true })
  })

  renderTransactionStatus = () => {
    if (this.props.signatureNeeded || this.props.transactionStatus === PENDING) {
      return (
        <div className='dashboard-entity-loader'>
          <Loader color='#3a3269' className='loader' />
        </div>
      )
    }
  }

  setShowingSearch = () => this.setState({ showSearch: !this.state.showSearch })

  setSearchValue = (e) => this.setState({ search: e.target.value })

  filterBySearch = (search, entities) =>
    search ? entities.filter(entity =>
      entity.name.toLowerCase().search(
        this.state.search.toLowerCase()) !== -1
    ) : entities

  renderBusiness (entities) {
    if (entities.length) {
      return (
        entities.map((entity, index) =>
          <Entity
            key={index}
            index={index}
            entity={entity}
            address={this.props.homeTokenAddress}
            showProfile={() => this.showProfile(this.props.listAddress, this.props.listHashes[index])}
          />
        ))
    } else {
      return <p className='emptyText'>There is no any entities</p>
    }
  }

  canDeployBusinessList = () => !this.props.signatureNeeded &&
    isOwner(this.props.token, this.props.accountAddress) &&
    this.props.homeTokenAddress

  render () {
    const { network: { networkType } } = this.props

    const business = this.props.entities
    const filteredBusiness = this.filterBySearch(this.state.search, business)
    return (
      <div className='dashboard-entity-container'>
        <button
          className='quit-button ctrl-btn'
          onClick={this.showHomePage}
        >
          <FontAwesome className='ctrl-icon' name='times' />
        </button>
        {!this.props.listAddress
          ? <div className='dashboard-entity-content'>
            <p className='dashboard-entity-content-title'>
              Businesses List
            </p>
            <p className='dashboard-entity-content-text'>
              This thing needs be activated some kind of text and explanation
            </p>
            <button
              className='dashboard-transfer-btn'
              onClick={this.props.loadBusinessListPopup}
              disabled={!this.canDeployBusinessList()}
            >
              Deploy business list
            </button>
          </div>
          : (
            <React.Fragment>
              <div className='dashboard-entity-content'>
                <div className='dashboard-entity-content-flex'>
                  <p className='dashboard-entity-content-title'>Businesses List</p>
                  <button
                    className='btn-entity-adding'
                    onClick={this.handleAddBusiness}
                    disabled={this.props.transactionStatus === REQUEST || this.props.transactionStatus === PENDING}
                  >
                    {
                      networkType === 'fuse'
                        ? (
                          <span className='dashboard-entity-content-plus-icon'>
                            <a style={{ backgroundImage: `url(${plusIcon})` }} />
                          </span>
                        ) : (
                          <span className='dashboard-entity-content-plus-icon'>
                            <FontAwesome name='plus-circle' />
                          </span>
                        )
                    } New Business
                  </button>
                </div>
                <div className='dashboard-entity-search-content'>
                  <button className='btn-entity-search' onClick={() => this.setShowingSearch()}>
                    <FontAwesome name='search' />
                  </button>
                  <input value={this.state.search} onChange={this.setSearchValue} placeholder='Search a business...' />
                </div>
              </div>
              {business.length ? this.renderBusiness(filteredBusiness)
                : <div className='dashboard-empty'>
                  <div className='dashboard-empty-title'>Kinda sad in here, isn’t it?</div>
                  <div className='dashboard-empty-text'>You can keep watching Netflix later, add a business and let’s start Rock’n’Roll!</div>
                  <button
                    className='dashboard-transfer-btn'
                    onClick={this.handleAddBusiness}
                    disabled={this.props.transactionStatus === REQUEST || this.props.transactionStatus === PENDING}
                  >
                    Add new business
                  </button>
                </div>
              }
            </React.Fragment>
          )}
        {this.renderTransactionStatus()}
        {!this.props.listAddress && <div className='dashboard-empty-list'>
          <img src={EmptyBusinessList} />
        </div>}
        <EntityDirectoryDataFetcher
          fetchHomeToken={this.props.fetchHomeToken}
          getList={this.props.getList}
          listAddress={this.props.listAddress}
          homeTokenAddress={this.props.homeTokenAddress}
          foreignTokenAddress={this.props.foreignTokenAddress}
          fetchBusinesses={this.props.fetchBusinesses}
          transactionStatus={this.props.transactionStatus} />
      </div>
    )
  }
}

const mapStateToProps = (state, { match, foreignTokenAddress }) => ({
  entities: getEntities(state),
  network: state.network,
  clnBalance: getClnBalance(state),
  accountAddress: getAccountAddress(state),
  homeTokenAddress: state.entities.bridges[foreignTokenAddress] && state.entities.bridges[foreignTokenAddress].homeTokenAddress,
  ...state.screens.directory,
  ...getTransaction(state, state.screens.directory.transactionHash)
})

const mapDispatchToProps = {
  getList,
  addEntity,
  loadModal,
  hideModal,
  fetchBusinesses,
  fetchHomeToken
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDirectory)
