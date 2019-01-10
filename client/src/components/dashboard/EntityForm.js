import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextInput from 'components/elements/TextInput'

class EntityForm extends Component {
  state = {
    name: '',
    address: ''
  }

  handleAddEntity = () => this.props.addEntity(this.state)

  handleNameChange = (event) => this.setState({name: event.target.value})
  handleAddressChange = (event) => this.setState({address: event.target.value})

  render = () => (
    <div>
      <TextInput
        id='name'
        type='text'
        autoFocus
        value={this.state.name}
        onChange={this.handleNameChange}
      />
      <TextInput
        id='description'
        type='text'
        autoFocus
        value={this.state.address}
        onChange={this.handleAddressChange}
      />
      <div>
        <button onClick={this.handleAddEntity}>Add Entity</button>
      </div>
    </div>)
}

EntityForm.propTypes = {
  addEntity: PropTypes.func.isRequired
}

export default EntityForm
