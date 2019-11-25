import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from 'react-accessible-accordion'
import TotalSupply from 'components/wizard/components/TotalSupply'
import LogosOptions from 'components/wizard/components/LogosOptions'
import CurrencySymbol from 'components/wizard/components/CurrencySymbol'
import CurrencyType from 'components/wizard/components/CurrencyType'
import Plugins from 'components/wizard/components/Plugins'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
import { connect, getIn, Field } from 'formik'

const DetailsStep = ({
  formik,
  networkType
}) => {
  const isOpen = getIn(formik.values, 'isOpen')
  const communityType = getIn(formik.values, 'communityType')
  return (
    <Accordion preExpanded={[0]}>
      <AccordionItem uuid={0}>
        <AccordionItemHeading>
          <AccordionItemButton>Token</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <CurrencyType networkType={networkType} />
          {
            communityType && communityType.value && communityType.label && (
              <TotalSupply />
            )
          }
          <CurrencySymbol />
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem uuid={1}>
        <AccordionItemHeading>
          <AccordionItemButton>Community</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <LogosOptions />
          <CoverPhoto />
          <div className='close_open_community'>
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
            <div className='close_open_community__text'>
              <span>{isOpen ? 'Open' : 'Close'} community:</span>
              {isOpen
                ? <span>&nbsp;Any user can join the community</span>
                : <span>&nbsp;Users can add themselves but need to approve them</span>
              }
            </div>
          </div>
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem uuid={2}>
        <AccordionItemHeading>
          <AccordionItemButton>Plugins</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <Plugins />
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default connect(DetailsStep)
