import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  onClick = () => {
    const { label, onClick } = this.props
    onClick(label)
  }

  render () {
    const {
      onClick,
      props: {
        activeTab,
        label,
        flexBasis,
        className
      }
    } = this

    return (
      <li
        style={{ flexBasis }}
        className={classNames(`tab__item`, { 'tab__item--active': activeTab === label }, { [className]: className })}
        onClick={onClick}
      >
        <span>{label}</span>
      </li>
    )
  }
}

export default Tab
