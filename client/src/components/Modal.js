import React, { Component } from 'react'
import classNames from 'classnames'
import CloseButton from 'images/x.png'

export default class Modal extends Component {
	listenKeyboard(event) {
	  if (event.key === 'Escape' || event.keyCode === 27) {
	    this.props.onClose()
	  }
	}
	
	componentDidMount() {
	  if (this.props.onClose) {
	    window.addEventListener('keydown', this.listenKeyboard.bind(this), true)
	  }
	}
	
	componentWillUnmount() {
	  if (this.props.onClose) {
	    window.removeEventListener('keydown', this.listenKeyboard.bind(this), true)
	  }
	}
	
	onOverlayClick() {
	  this.props.onClose()
	}
	
	onDialogClick(event) {
	  event.stopPropagation()
	}

	render() {
		return (
			<div>
			  <div className={"modal-overlay-div"}  />
			  <div className={"modal-content-div " + this.props.class} onClick={this.onOverlayClick.bind(this)}>
			    <div className={"modal-dialog-div " + this.props.class} style={{ width: this.props.width || '432px' }} onClick={this.onDialogClick}>
			    	<div className="sidebar-close" onClick={this.onOverlayClick.bind(this)}>
						<img src={CloseButton}/>
					</div>
			    	{this.props.children}
			    </div>
			  </div>
			</div>
		)
	}
}