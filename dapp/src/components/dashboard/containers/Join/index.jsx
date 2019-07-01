import React, { Component } from 'react'
import { connect } from 'react-redux'
import { joinCommunity } from 'actions/communityEntities'
import JoinCommunity from 'components/dashboard/components/JoinCommunity'
import Web3 from 'containers/Web3'

class JoinProvider extends Component {
  state = {
    user: {},
    pk: ''
  }
  componentDidMount () {
    setTimeout(() => {
      if (window && window.user) {
        console.log({ user: window.user })
        this.setState({ user: { ...window.user } })
      }
      if (window && window.pk) {
        console.log({ pk: window.pk })
        this.setState({ pk: window.pk })
      }
    }, 5000)
  }

  render () {
    return (
      <div>
        {
          this.state.pk
            ? (
              <React.Fragment>
                <Web3 />
                <JoinCommunity data={this.state.user} joinCommunity={this.props.joinCommunity} />
              </React.Fragment>
            )
            : undefined
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({ })

const mapDispatchToProps = {
  joinCommunity
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinProvider)
