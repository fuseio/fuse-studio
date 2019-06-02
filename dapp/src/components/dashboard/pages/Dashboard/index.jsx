import React, { Component } from 'react'
import Sidebar from '../../components/Sidebar'

export default class Dashboard extends Component {
  render () {
    return (
      <div className='Dashboard'>
        <div className='Dashboard__container'>
          <Sidebar />
          <div className='content'>
            fdsfs
          </div>
        </div>
      </div>
    )
  }
}
