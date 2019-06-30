import React, { Component } from 'react'

class Join extends Component {
  componentDidMount () {
    setTimeout(() => {
      console.log(window.user)
    }, 3000)
  }
  render = () => <div>Join</div>
}

export default Join
