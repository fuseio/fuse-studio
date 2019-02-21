import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import ReactGA from 'services/ga'
import Loader from 'components/Loader'
import {getClnBalance, getAccountAddress} from 'selectors/accounts'
import {REQUEST, SUCCESS} from 'actions/constants'
import {getEntities} from 'selectors/directory'
import {createList, getList, addEntity, fetchEntities} from 'actions/directory'
import Header from './Header'
import Entity from './Entity'
import {loadModal, hideModal} from 'actions/ui'
import { ADD_DIRECTORY_ENTITY } from 'constants/uiConstants'

class EntityDirectory extends Component {
  state = {
    showSearch: false,
    search: ''
  }
  setQuitDashboard = () => this.props.history.goBack()

  showHomePage = (address) => {
    this.props.history.push('/')
  }

  handleAddEntity = (data) => {
    this.props.addEntity(this.props.listAddress, data)
    this.props.hideModal()
  }

  handleCreateList = () => this.props.createList(this.props.tokenAddress)

  componentDidMount () {
    this.props.getList(this.props.tokenAddress)
  }

  componentDidUpdate (prevProps) {
    if (
      (this.props.listAddress && this.props.listAddress !== prevProps.listAddress) ||
      (this.props.transactionStatus !== prevProps.transactionStatus && this.props.transactionStatus === SUCCESS)
    ) {
      this.props.fetchEntities(this.props.listAddress, 1)
    }
  }

  loadAddingModal = () => this.props.loadModal(ADD_DIRECTORY_ENTITY, {
    handleAddEntity: this.handleAddEntity
  })

  renderTransactionStatus = (transactionStatus) => {
    if (transactionStatus === REQUEST) {
      return (
        <div className='dashboard-entity-loader'>
          <Loader color='#3a3269' className='loader' />
        </div>
      )
    }
  }
  showProfile = (address, hash) => {
    this.props.history.push(`/view/directory/${address}/${hash}`)
    ReactGA.event({
      category: 'Profile',
      action: 'Click',
      label: 'profile'
    })
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
            showProfile={() => this.showProfile(this.props.match.params.address, this.props.listHashes[index])}
          />
        ))
    } else {
      return <p className='emptyText'>There is no any entities</p>
    }
  }

  render () {
    const business = this.props.entities
    const filteredBusiness = this.filterBySearch(this.state.search, business)
    return [
      <Header
        accountAddress={this.props.accountAddress}
        clnBalance={this.props.clnBalance}
        match={this.props.match}
        history={this.props.history}
        showHomePage={this.showHomePage}
        key={0}
      />,
      <div className='dashboard-content' key={1}>
        <div className='dashboard-entity-container'>
          <button
            className='quit-button ctrl-btn'
            onClick={this.showHomePage}
          >
            <FontAwesome className='ctrl-icon' name='times' />
          </button>
          {!this.props.listAddress
            ? <div className='dashboard-entity-content flex-end'>
              <button
                className='btn-entity-adding'
                onClick={() => this.handleCreateList()}
                disabled={this.props.transactionStatus === REQUEST}
              >
                + Create List
              </button>
            </div>
            : (
              <div>
                <div className='dashboard-entity-content'>
                  {!this.state.showSearch
                    ? <React.Fragment>
                      <div className='dashboard-entity-search'>
                        All business
                        <button className='btn-entity-search' onClick={() => this.setShowingSearch()}>
                          <FontAwesome name='search' />
                        </button>
                      </div>
                      <button
                        className='btn-entity-adding'
                        onClick={() => this.loadAddingModal()}
                        disabled={this.props.transactionStatus === REQUEST}
                      >
                        + New Business
                      </button>
                    </React.Fragment>
                    : <div className='dashboard-entity-search-content'>
                      <input value={this.state.search} onChange={this.setSearchValue} />
                      <button className='btn-entity-search' onClick={() => this.setShowingSearch()}>
                        <FontAwesome name='times' />
                      </button>
                    </div>
                  }
                </div>
                {this.renderBusiness(filteredBusiness)}
              </div>
            )}
          {this.renderTransactionStatus(this.props.transactionStatus)}
        </div>
      </div>
    ]
  }
}

const mapStateToProps = (state, {match}) => ({
  tokenAddress: match.params.address,
  entities: getEntities(state),
  network: state.network,
  clnBalance: getClnBalance(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.directory
})

const mapDispatchToProps = {
  createList,
  getList,
  addEntity,
  fetchEntities,
  loadModal,
  hideModal
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDirectory)
