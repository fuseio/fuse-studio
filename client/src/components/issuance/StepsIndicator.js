import React from 'react'
import classNames from 'classnames'

const StepsIndicator = ({steps, activeStep, network}) => {
  return steps.map((item, key) => {
    const stepsClassStyle = classNames('cell large-2 medium-2 small-4', {
      [`step-${network}`]: true,
      [`step-${network}--active`]: key === activeStep,
      [`step-${network}--done`]: key < activeStep
    })
    return (
      <div key={key} className={stepsClassStyle} />
    )
  })
}

export default StepsIndicator
