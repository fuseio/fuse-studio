import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import { isMobile } from "react-device-detect"

import { render } from 'react-dom'
import { withFormik } from 'formik'
import Yup from 'yup'
import classnames from 'classnames'

import * as uiActions from '../actions/ui'
import Select from './Select'
import {sendContactUs, subcribeToMailingList} from 'services/api'
import CloseButton from 'images/x.png'

const InputFeedback = ({ error }) =>
  error ? (
    <div className="input-feedback">{error}</div>
  ) : null;

const Label = ({
  error,
  className,
  children,
  ...props
}) => {
  return (
    <label className="label" {...props}>
      {children}
    </label>
  );
}

const options = [
	{ value: 'Buy & Sell CLN / CC', label: 'Buy & Sell CLN / CC'},
	{ value: 'Issue new coin', label: 'Issue new coin' },
	{ value: 'Partnerships', label: 'Partnerships' },
	{ value: 'Technical Issue', label: 'Technical Issue (?)' },
	{ value: 'General Inquiry', label: 'General Inquiry' }
]

const TextInput = ({
	fieldType,
	type,
	id,
	label,
	error,
	value,
	onChange,
	className,
	setFieldValue,
	children,
	...props
}) => {
	const classes = classnames(
		'contact-field-wrapper',
		{
			'checkbox': fieldType === 'checkbox',
			'animated shake error': !!error,
		},
		className
	)
	let field
	switch(fieldType) {
		case "textarea": {
			field = <textarea
					id={id}
					className="text-input"
					type={type}
					value={value}
					onChange={onChange}
					style={{height: isMobile ? 'auto' : '52px'}}
					{...props}
				/>
			break;
		}
		case "select": {
			field = <Select id={id} value={value} setFieldValue={setFieldValue} options={options} {...props}/>
			break;
		}
		case "checkbox": {
			field = <input
					id={id}
					type={type}
					checked={value}
					onChange={onChange}
					{...props}/>
			break;
		}
		default: {
			field = <input
					id={id}
					className="text-input"
					type={type}
					value={value}
					onChange={onChange}
					{...props}/>
			break;
		}
	}
	return (
		<div className={classes}>
			<Label htmlFor={id} error={error}>
				{label}
			</Label>
			{field}
			<InputFeedback error={error} />
		</div>
	);
}


// Our inner form component. Will be wrapped with Formik({..})
const MyInnerForm = props => {
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
		history,
		status,
		handleReset,
	} = props;

	return (
		<div className="contact-form">
			<h4>CONTACT US</h4>
			<div className="sidebar-close" onClick={history.goBack}>
				<img src={CloseButton}/>
			</div>
			<div className="contact-container">
				<form onSubmit={handleSubmit}>
					<div className="contact-horizontal">
					<TextInput
					  id="fullName"
					  type="text"
					  label="FULL NAME *"
					  placeholder="John"
					  error={touched.fullName && errors.fullName}
					  value={values.fullName}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>
					<TextInput
					  id="email"
					  type="email"
					  label="EMAIL *"
					  placeholder="Enter your email"
					  error={touched.email && errors.email}
					  value={values.email}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>
					<TextInput
					  id="phone"
					  type="phone"
					  label="PHONE NUMBER"
					  placeholder="Enter your email"
					  error={touched.phone && errors.phone}
					  value={values.phone}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>
					<TextInput
					  id="company"
					  type="company"
					  label="COMPANY / ORGANIZATION"
					  placeholder="Company"
					  error={touched.company && errors.company}
					  value={values.company}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>
					</div>
					<div className="contact-horizontal">
					<TextInput
					  id="subject"
					  type="subject"
					  label="SUBJECT *"
					  fieldType="select"
					  placeholder="Select"
					  error={touched.subject && errors.subject}
					  value={values.subject}
					  setFieldValue={setFieldValue}
					  onBlur={handleBlur}
					>
					</TextInput>
					<TextInput
					  id="message"
					  type="message"
					  label="MESSAGE"
					  placeholder="Message"
					  fieldType="textarea"
					  error={touched.message && errors.message}
					  value={values.message}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>
					<TextInput
					  id="signup"
					  type="checkbox"
					  label="SIGN UP FOR UPDATES"
					  fieldType="checkbox"
					  value={!!values.signup}
					  onChange={handleChange}
					  onBlur={handleBlur}
					/>

					<button type="submit" disabled={!isValid}>
						Submit
					</button>
					</div>
				</form>
				<p className="success-message">{status && status.success ? "Thanks for getting in touch. We'll reach out to you shortly." : null}</p>
			</div>
		</div>
	);
};

const EnhancedForm = withFormik({
	mapPropsToValues: () => ({ fullName: '', email: '' }),
	validationSchema: Yup.object().shape({
		fullName: Yup.string()
			.min(2, "C'mon, your name is longer than that")
			.required('Your name is required.'),
		email: Yup.string()
			.email('Invalid email address')
			.required('Email is required.'),
		phone: Yup.string()
			.matches(/^[a-z0-9]+$/i, 'Invalid phone number'),
		company: Yup.string()
			.matches(/^[a-z0-9]+$/i, 'Invalid input'),
		subject: Yup.string()
			.required('Subject is required.'),
	}),

	handleSubmit: (values, { setSubmitting, setStatus, resetForm }) => {
		setSubmitting(false)
    sendContactUs(values)
    if (values.signup) {
       subcribeToMailingList({email: values.email})
    }
    resetForm()
    setStatus({ success: true })
	},
	displayName: 'BasicForm', // helps with React DevTools
})(MyInnerForm)

export default EnhancedForm
