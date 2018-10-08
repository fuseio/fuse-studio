import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from './../TextInput'
import PropTypes from 'prop-types'

export default class SymbolStep extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showCustomSymbol: false
    }
  }

  componentWillUnmount () {
    if (this.state.showCustomSymbol) {
      this.setState({showCustomSymbol: false})
    }
  }

  toggleCustomSymbol = () => {
    this.setState({showCustomSymbol: !this.state.showCustomSymbol})
  }
  render () {
    return (
      <div className='step-content-symbol'>
        <h2 className='step-symbol-title'>{'\'' + this.props.communityName + '\''}</h2>
        <h2 className='step-content-title'>Currency Symbol</h2>
        <div className='step-content-symbol-field'>
          {!this.state.showCustomSymbol
            ? this.props.communitySymbol
            : <TextInput
              className='step-community-symbol'
              id='communitySymbol'
              type='text'
              maxLength='3'
              autoFocus
              placeholder='Type your community symbol...'
              value={this.props.communitySymbol}
              onChange={this.props.handleChangeCommunitySymbol}
            />
          }
        </div>
        <div className='text-center'>
          <button className='btn-download edit-symbol' onClick={() => this.setState({showCustomSymbol: !this.state.showCustomSymbol})}>
            <FontAwesome name={!this.state.showCustomSymbol ? 'edit' : 'times-circle'} /> {!this.state.showCustomSymbol ? 'Edit' : 'Cancel'}
          </button>
        </div>
        <button
          className='symbol-btn'
          onClick={this.props.setNextStep}
        >
          Approve symbol <FontAwesome name='angle-right' className='symbol-icon' />
        </button>
      </div>
    )
  }
}

SymbolStep.propTypes = {
  communityName: PropTypes.string,
  setNextStep: PropTypes.func.isRequired,
  communitySymbol: PropTypes.string,
  handleChangeCommunitySymbol: PropTypes.func.isRequired
}
