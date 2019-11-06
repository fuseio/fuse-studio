import React from 'react'
import { connect, Field, getIn } from 'formik'
import ContractsType from 'constants/contractsType'

const Contracts = ({
  formik,
  ...props
}) => {
  const isOpen = getIn(formik.values, 'isOpen')
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
                        <Field
                          name='isOpen'
                          render={({ field, form: { setFieldValue } }) => (
                            <label className='toggle'>
                              <input
                                type='checkbox'
                                checked={isOpen}
                                onChange={e => {
                                  setFieldValue('isOpen', e.target.checked)
                                  e.preventDefault()
                                  if (window && window.analytics) {
                                    window.analytics.track(`Community status - ${e.target.checked ? 'open' : 'close'}`)
                                  }
                                }}
                                {...field}
                              />
                              <div className='toggle-wrapper'>
                                <span className='toggle' />
                              </div>
                            </label>
                          )}
                        />
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
    </div>
  )
}

export default connect(Contracts)
