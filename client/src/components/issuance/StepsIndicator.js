import React from 'react'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

const StepsIndicator = ({steps, activeStep, doneStep}) => {
  let stepArr = []
  steps.forEach((item, key) => {
    const stepsClassStyle = classNames({
      'step': true,
      'active-step': key === activeStep,
      'done-step': key === doneStep || key < doneStep
    })
    stepArr.push(
      <div key={key} className={stepsClassStyle}>
        {(key === doneStep || key < doneStep) && <FontAwesome className='done-check' name='check' />}
        {item}
      </div>
    )
  })
  return stepArr
}

export default StepsIndicator
