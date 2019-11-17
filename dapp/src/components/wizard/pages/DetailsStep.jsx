import React, { Fragment } from 'react'
import TotalSupply from 'components/wizard/components/TotalSupply'
import LogosOptions from 'components/wizard/components/LogosOptions'
import SymbolStep from 'components/wizard/components/SymbolStep'
import { connect, getIn } from 'formik'

const DetailsStep = ({
  formik
}) => {
  const communityType = getIn(formik.values, 'communityType')
  return (
    <div className='attributes'>
      <Fragment>
        {
          communityType && communityType.value && communityType.label && (
            <TotalSupply />
          )
        }
        <SymbolStep />
        <LogosOptions />
      </Fragment>
    </div>
  )
}

export default connect(DetailsStep)
