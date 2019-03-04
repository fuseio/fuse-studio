import React, { Component } from 'react'

class Breadcrumbs extends Component {
  render () {
    return (
      <div className='breadcrumbs'>
        <div className='breadcrumbs-title' onClick={() => this.props.setToHomepage()}>Communities</div>
        <div className='breadcrumbs-text'>{this.props.breadCrumbsText}</div>
      </div>
    )
  }
}

export default Breadcrumbs
