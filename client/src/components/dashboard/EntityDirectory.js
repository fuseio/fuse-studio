import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import {getEntities} from 'selectors/directory'
import {createList, getList, addEntity, fetchEntities} from 'actions/directory'
import ClnIcon from 'images/cln.png'
import EntityForm from './EntityForm'
import Entity from './Entity'

class EntityDirectory extends Component {
  setQuitDashboard = () => this.props.history.goBack()

  handleAddEntity = (data) => this.props.addEntity(this.props.listAddress, data)

  handleCreateList = () => this.props.createList(this.props.tokenAddress)

  componentDidMount () {
    this.props.getList(this.props.tokenAddress)
  }

  componentDidUpdate (prevProps) {
    if (this.props.listAddress && this.props.listAddress !== prevProps.listAddress) {
      this.props.fetchEntities(this.props.listAddress, 1)
    }
  }

  render () {
    return (
      <div className='dashboard-content'>
        <div className='dashboard-header'>
          <div className='dashboard-logo'>
            <a href='https://cln.network/' target='_blank'><img src={ClnIcon} /></a>
          </div>
          <button
            className='quit-button ctrl-btn'
            onClick={this.setQuitDashboard}
          >
            <FontAwesome className='ctrl-icon' name='times' />
          </button>
        </div>
        <div className='dashboard-entity-container'>
          EntityDirectory
          {
            !this.props.listAddress
              ? <button onClick={this.handleCreateList}>Create List</button>
              : (<div>
                <EntityForm addEntity={this.handleAddEntity} />
                {this.props.entities.map((entity, index) => <Entity key={index} entity={entity} />)}
              </div>)
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, {match}) => ({
  tokenAddress: match.params.address,
  entities: getEntities(state),
  ...state.screens.directory
})

const mapDispatchToProps = {
  createList,
  getList,
  addEntity,
  fetchEntities
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDirectory)
