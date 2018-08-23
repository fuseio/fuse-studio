import React, { Component, Fragment } from 'react'

import Select from 'react-select'

export default class SingleSelect extends Component {
  handleChange (selected) {
    this.props.setFieldValue(this.props.id, selected.value, true)
  }
  render () {
    return (
      <Fragment>
        <Select
          name='select'
          options={this.props.options}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          placeholder={'Choose subject'}
          isSearchable={false}
          onChange={this.handleChange.bind(this)}
          styles={{
            option: (base, state) => ({...base, backgroundColor: '#ffffff', color: state.isSelected ? '#3d3d3d' : '#8d9293', fontWeight: state.isSelected ? 'bold' : 'normal'}),
            container: (base) => ({...base, backgroundColor: '#ffffff', border: 'none'}),
            menu: (base) => ({...base, borderRadius: 0}),
            indicatorSeparator: (base) => ({...base, backgroundColor: '#ffffff', border: 'none'}),
            control: (base, state) => ({...base, boxShadow: 'none', minHeight: '32px', height: '32px', backgroundColor: '#ffffff', border: 'none', borderColor: '#979797', borderBottom: '1px solid #979797', borderRadius: 0})
          }}
        />
      </Fragment>
    )
  }
}
