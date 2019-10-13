import React, { Fragment } from 'react'
import { isMobileOnly } from 'react-device-detect'
import TotalSupply from '../components/TotalSupply'
import LogosOptions from '../components/LogosOptions'
import SymbolStep from '../components/SymbolStep'
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
            <LogosOptions networkType={networkType} />
          </Fragment>
        )
    }
  }

  const mainLayout = () => {
    return (
      <Fragment>
        {
          communityType && (
            <TotalSupply />
          )
        }
        <SymbolStep />
        <LogosOptions networkType={networkType} />
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
