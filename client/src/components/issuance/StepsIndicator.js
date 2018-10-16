import React from 'react'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

const StepsIndicator = ({steps, activeStep}) => {
  return steps.map((item, key) => {
    const stepsClassStyle = classNames({
      'step': true,
      'active-step': key === activeStep,
      'done-step': key < activeStep
    })
    return (
      <div key={key} className={stepsClassStyle}>
        {(key < activeStep) && <FontAwesome className='done-check' name='check' />}
        {item}
      </div>
    )
  })
}

export default StepsIndicator
