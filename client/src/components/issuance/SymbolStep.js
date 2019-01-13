import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import TextInput from 'components/elements/TextInput'
import PropTypes from 'prop-types'

export default class SymbolStep extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showCustomSymbol: false,
      customSymbol: props.communitySymbol
    }
  }

  toggleCustomSymbol = () => {
    this.setState({showCustomSymbol: !this.state.showCustomSymbol})
  }

  handleChangeCustomSymbol = (event) => {
    this.setState({customSymbol: event.target.value})
  }

  setCancelEditing = () => {
    this.setState({showCustomSymbol: !this.state.showCustomSymbol})
    this.setState({customSymbol: this.props.communitySymbol})
  }

  setNextStep = () => {
    if (this.state.customSymbol.length > 2) {
      this.props.handleChangeCommunitySymbol(this.state.customSymbol)
      this.props.setNextStep()
    } else {
      this.props.handleChangeCommunitySymbol(this.props.communitySymbol)
      this.props.setNextStep()
    }
  }

  render () {
    return (
      <div className='step-content-symbol'>
        <h2 className='step-symbol-title'>{'\'' + this.props.communityName + '\''}</h2>
        <h2 className='step-content-title'>Currency Symbol</h2>
        <div className='step-content-symbol-field'>
          {this.state.customSymbol.length < 1 &&
            this.state.showCustomSymbol &&
            <label className='step-content-symbol-field-label'>Type your community symbol...</label>}
          {this.state.showCustomSymbol
            ? <TextInput
              className='step-community-symbol'
              id='communitySymbol'
              type='text'
              maxLength='3'
              autoFocus
              value={this.state.customSymbol}
              onChange={this.handleChangeCustomSymbol}
            />
            : (this.state.customSymbol.length > 2 ? this.state.customSymbol : this.props.communitySymbol)
          }
        </div>
        <div className='text-center'>
          {!this.state.showCustomSymbol
            ? <button
              className='btn-download edit-symbol'
              onClick={() => this.setState({showCustomSymbol: !this.state.showCustomSymbol})}
            >
              <FontAwesome name='edit' /> Edit
            </button>
            : <button
              className='btn-download edit-symbol'
              onClick={this.setCancelEditing}
            >
              <FontAwesome name='times-circle' /> Cancel
            </button>
          }
        </div>
        <button
          className='symbol-btn'
          disabled={this.props.communitySymbol.length < 3 || this.state.customSymbol.length < 3}
          onClick={this.setNextStep}
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
