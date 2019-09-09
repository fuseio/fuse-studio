import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ContractsType from 'constants/contractsType'
// import TextField from '@material-ui/core/TextField'
import { sendEmail } from 'actions/accounts'

class Contracts extends PureComponent {
  state = {
    email: ''
  }

  setEmail = (email) => {
    this.setState({ email })
  }

  validateEmail = () => {
    const { email } = this.state
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  render () {
    const { setNextStep, contracts, setCommunityPrivacy, isOpen } = this.props

    return (
      <div className='contracts__wrapper'>
        <h3 className='contracts__title'>
          Configure your community using smart contracts
        </h3>
        <div className='contracts__options'>
          {
            ContractsType.map(({ label, text, key, icon }) => {
              return (
                <div key={label} className='contracts__item'>
                  <span className='icon'><img src={icon} /></span>
                  <div className='content'>
                    <div className='content__title'>{label}</div>
                    <div className='content__text'>{text}</div>
                    {
                      key === 'community' && (
                        <div className='content__toggle'>
                          <label className='toggle'>
                            <input
                              type='checkbox'
                              disabled={contracts['community'] && !contracts['community'].checked}
                              checked={isOpen}
                              onChange={e => setCommunityPrivacy(e.target.checked)}
                            />
                            <div className='toggle-wrapper'>
                              <span className='toggle' />
                            </div>
                          </label>
                          <div className='content__toggle__text'>
                            <span>{isOpen ? 'Open' : 'Close'} community:</span>
                            {isOpen
                              ? <span>&nbsp;Any user can join the community</span>
                              : <span>&nbsp;Users can add themselves but need to approve them</span>
                            }
                          </div>
                        </div>
                      )
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        {/* TODO - send welcome email */}
        {/* <div className='email__form'>
          <p className='email__form__text'>Leave us your mail and we will notify you when the community is ready with all the essential information:</p>
          <div className='grid-x align-middle email__form__wrapper'>
            <TextField
              onChange={(e) => this.setEmail(e.target.value)}
              type='email'
              placeholder='Insert your email'
              classes={{
                root: 'email__form__field cell small-18'
              }}
              InputProps={{
                classes: {
                  underline: 'email__form__field--underline',
                  error: 'email__form__field--error'
                }
              }}
            />
            <button
              style={{ marginLeft: '1em' }}
              className='button button--normal cell small-4'
              disabled={!this.validateEmail()}
              onClick={() => sendEmail(this.state.email)}
            >
              Send
            </button>
          </div>
        </div> */}
        <div className='grid-x align-center next'>
          <button
            className='button button--normal'
            onClick={setNextStep}
          >
            Next
          </button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  sendEmail
}

export default connect(null, mapDispatchToProps)(Contracts)
