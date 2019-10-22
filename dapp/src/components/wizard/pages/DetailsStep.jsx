import React, { Fragment } from 'react'
import { isMobileOnly } from 'react-device-detect'
import TotalSupply from 'components/wizard/components/TotalSupply'
import LogosOptions from 'components/wizard/components/LogosOptions'
import SymbolStep from 'components/wizard/components/SymbolStep'
import { connect, getIn } from 'formik'

const DetailsStep = ({
  networkType,
  formik
}) => {
  const communityType = getIn(formik.values, 'communityType')
  const mobileLayout = () => {
    const { currentStep } = this.state

    switch (currentStep) {
      case 0:
        return <TotalSupply />
      case 1:
        return (
          <Fragment>
            <SymbolStep />
            {isMobileOnly && <div className='line' ><hr /></div>}
            <LogosOptions />
          </Fragment>
        )
    }
  }

  const mainLayout = () => {
    return (
      <Fragment>
        {
          communityType && communityType.value && communityType.label && (
            <TotalSupply />
          )
        }
        <SymbolStep />
        <LogosOptions />
      </Fragment>
    )
  }

  return (
    <div className='attributes'>
      {
        !isMobileOnly
          ? mainLayout()
          : mobileLayout()
      }
    </div>
  )
}

export default connect(DetailsStep)
