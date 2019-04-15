import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tab from './Tab'

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      activeTab: this.props.children[0].props.label,
    }
  }

  onClickTabItem = (tab) => {
    this.setState({ activeTab: tab })
  }

  renderLabels = () => {
    const {
      onClickTabItem,
      props: {
        children,
      },
      state: {
        activeTab,
      }
    } = this

    const numberOfTabs = children.filter(Boolean).length

    return children.map((child) => {
      if (!child) {
        return
      }
      const { label } = child.props

      return (
        <Tab
          activeTab={activeTab}
          key={label}
          label={label}
          flexBasis={`${100 / numberOfTabs}%`}
          onClick={onClickTabItem}
        />
      )
    })
  }

  renderContent = () => {
    const {
      props: {
        children,
      },
      state: {
        activeTab
      }
    } = this

    return children.map((child) => {
      if (!child) {
        return
      }
      return child.props.label === activeTab ? child.props.children : undefined
    })
  }

  render() {
    return (
      <div className='tab__wrapper'>
        <ol className="tab__list">
          {this.renderLabels()}
        </ol>
        <div className="tab__content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default Tabs
