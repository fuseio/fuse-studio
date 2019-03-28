import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "components/Modal";
import MediaMobile from "images/issue-popup-mobile.svg";
import { addUser } from "actions/user";
import FontAwesome from "react-fontawesome";
import CountriesList from "constants/countries";
import Select from "react-select";
import { Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";

class UserDatatModal extends Component {
  constructor(props) {
    super(props);

    this.initialValues = {
      country: {},
      firstName: "",
      lastName: "",
      email: "",
      subscribe: true
    };

    this.validationSchema = yup
      .object()
      .noUnknown(false)
      .shape({
        firstName: yup
          .string()
          .trim()
          .ensure()
          .label('First name')
          .required()
          .matches(/^[a-zA-Z]+$/, 'Please type only letters'),
        lastName: yup
          .string()
          .trim()
          .ensure()
          .label('Last name')
          .required()
          .matches(/^[a-zA-Z]+$/, 'Please type only letters'),
        email: yup
          .string()
          .email()
          .required(),
        subscribe: yup.boolean().default(true),
        country: yup.object().shape({
          label: yup.string(),
          value: yup.string()
        })
      });
  }

  onSubmit = (values, form) => {
    const { addUser, tokenAddress } = this.props;
    const {
      firstName,
      lastName,
      email,
      country: { value },
      subscribe
    } = values;

    addUser({
      firstName,
      lastName,
      email,
      country: value,
      subscribe
    }, tokenAddress)
    
  }

  renderForm (form) {
    const { errors, touched, handleSubmit, setFieldValue } = form;
    
    return (
      <form onSubmit={handleSubmit} noValidate className="issued-popup-container">
       
        <p className="issued-popup-text">
          {"Let's continue this wonderful relationship"}
        </p>
        <div className="form-control">
          <label>First Name</label>
          <div className="form-control-with-error">
            <Field
              id="firstName"
              type="text"
              name="firstName"
              placeholder="Type your first name"
            />
            <ErrorMessage name="firstName" render={err => <p className="error-text">{err}</p>} />
          </div>
        </div>
        <div className="form-control">
          <label>Last Name</label>
          <div className="form-control-with-error">
            <Field
              id="lastName"
              type="text"
              name="lastName"
              placeholder="Type your last name"
            />
            <ErrorMessage name="lastName" render={err => <p className="error-text" >{err}</p>} />
          </div>
        </div>
        <div className="form-control">
          <label>Email Address</label>
          <Field
            className={errors.email && touched.email ? 'form-control-error' : 'form-control-input'}
            id="email"
            type="email"
            name="email"
            placeholder="Type your email"
          />
        </div>
        <div className="form-control">
          <label>Country</label>
            <Select
              name="country"
              className="user-modal-select"
              classNamePrefix="user-modal-select-prefix"
              options={CountriesList}
              placeholder={"Select Country..."}
              onChange={(val) => setFieldValue('country', val)}
            />
        </div>
        <div className="form-control">
          <input
            className="checkbox-input"
            type="checkbox"
            id="subscribe"
            onClick={(e) => setFieldValue('subscribe', e.target.checked)}
            name="subscribe"
          />
          <label className="checkbox-label" htmlFor="subscribe">
            I agree to receive fuse emails
          </label>
        </div>
        <button className='issued-popup-btn' type="submit">Done</button>
      </form>
    );
  }

  render() {

    const {
      hideModal
    } = this.props;

    return (
      <Modal className="issued-popup" onClose={hideModal}>
        <div className="issued-popup-media">
          <h3 className="issued-popup-media-title">
            Congratulations, a new crypto was born
          </h3>
          <img className="issued-popup-media-img" src={MediaMobile} />
        </div>
        <Formik
          initialValues={this.initialValues}
          validationSchema={this.validationSchema}
          render={this.renderForm}
          onSubmit={this.onSubmit}
        />
        <div
          className="issued-popup-close"
          onClick={() => hideModal()}
        >
          <FontAwesome name="times" />
        </div>
      </Modal>
    );
  }
}

const mapDispatchToProps = {
  addUser
};

export default connect(
  null,
  mapDispatchToProps
)(UserDatatModal);
