import React, { Component } from 'react'
import classNames from 'classnames'
import { withFormik } from 'formik'
import { isMobile } from 'react-device-detect'
import Yup from 'yup'
import classnames from 'classnames'
import {subcribeToMailingList} from 'services/api'
import CloseButton from 'images/x.png'
import MobileSubmit from 'images/mobile-submit.png'

const InputFeedback = ({ error }) => error ? (<div className="input-feedback">{error}</div>) : null

const TextInput = ({
	type,
	id,
	error,
	value,
	onChange,
	className,
	...props
}) => {
	const classes = classnames(
		'contact-field-wrapper',
		{
			'animated shake error': !!error,
		},
		className
	)
	let field = <input
					id={id}
					className="text-input"
					type={type}
					value={value}
					onChange={onChange}
					{...props}/>

	return (
		<div className={classes}>
			{field}
		</div>
	)
}

const SignUp = props => {
	const {
		values,
		touched,
		errors,
		dirty,
		isSubmitting,
		isValid,
		setFieldValue,
		handleChange,
		handleBlur,
		handleSubmit,
		close,
		status,
		closed,
		handleReset,
	} = props

	const formContent = status && status.success ?
			<p className="success-message">Thanks for getting in touch. We'll reach out to you shortly.</p> :
			<form onSubmit={handleSubmit}>
				<TextInput
				  id="email"
				  type="email"
				  label="EMAIL *"
				  autoComplete="off"
				  placeholder="Enter your email"
				  error={touched.email && errors.email}
				  value={values.email}
				  onChange={handleChange}
				  onBlur={handleBlur}
				/>
	
				<button type="submit" disabled={!isValid}>
					{isMobile ? <img className="mobile-submit" src={MobileSubmit}/> : 'Submit'}
				</button>
			</form>
	return (
		<div>
		{formContent}
		</div>
	)
}

const SignUpForm = withFormik({
	validationSchema: Yup.object().shape({
		email: Yup.string()
			.email('Invalid email address')
			.required('')
	}),
	handleSubmit: (values, props) => {
		props.setSubmitting(false)
		props.setStatus({success: true})
		subcribeToMailingList(values)
		localStorage.setItem("signup", true)
	},
	displayName: 'SignUpForm', // helps with React DevTools
})(SignUp)

class SignUpFormBar extends Component {
	state = {
		closed: false,
		signupDone: localStorage.getItem("signup")
	}
	close = () => {
		this.setState({ closed: true })
	}
	render() {
		const wrapperClass = classnames({
			'sign-up-wrapper': true,
			'closed': this.state.closed || this.state.signupDone
		})

		return (
			<div className={wrapperClass}>
				{isMobile ? null : <p>Get CLN Updates</p>}
				<SignUpForm closeMe={this.close}/>
				<div className="sidebar-close" onClick={this.close}>
					<img src={CloseButton}/>
				</div>
			</div>
		)
	}
}

export default SignUpFormBar
