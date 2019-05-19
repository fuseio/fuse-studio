import React, { PureComponent } from 'react'
import FontAwesome from 'react-fontawesome'
import ContractsType from 'constants/contractsType'
import classNames from 'classnames'

export default class Contracts extends PureComponent {
  handleChange = ({ key, readOnly }, value) => {
    if (readOnly) return
    const { setContracts } = this.props

    setContracts({ key, value })
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
            ContractsType.map(({ label, text, key, readOnly, disabled }) => {
              return (
                <div key={label} className='contracts__checkbox'>
                  <input type='checkbox' className='input' id={key} checked={key && contracts[key] && contracts[key].checked} onChange={(e) => this.handleChange({ key, readOnly }, e.target.checked)} readOnly={readOnly} />
                  <label className={classNames('indicator', { 'indicator--disabled': disabled }, { 'indicator--read-only': readOnly })} htmlFor={key} />
                  <div className='content'>
                    <div className='content__title'>{label}</div>
                    <div className='content__text'>{text}</div>
                    {
                      key === 'membersList' && (
                        <div className='content__toggle'>
                          <label className='toggle'>
                            <input type='checkbox' disabled={contracts['membersList'] && !contracts['membersList'].checked} checked={isOpen} onChange={e => setCommunityPrivacy(e.target.checked)} />
                            <div className='toggle-wrapper'><span className='toggle' /></div>
                          </label>
                          <div className='content__toggle__text'>
                            <span>{ isOpen ? 'Open' : 'Close' } community:</span>

                            {
                              isOpen ? <span>&nbsp;Any user can join the community</span> : <span>&nbsp;Users can add themselves but need to approve them</span>
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
        <div className='grid-x align-center attributes__next'>
          <button
            className='button button--big'
            onClick={setNextStep}
          >
            NEXT
            <FontAwesome name='angle-right' />
          </button>
        </div>
      </div>
    )
  }
}
