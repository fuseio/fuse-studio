import React from 'react'
import CalculatorIcon from 'images/calculator-Icon.svg'
import FontAwesome from 'react-fontawesome'

const SummaryStep = ({ communityName, communityLogo, communitySymbol, totalSupply, setIssuanceTransaction }) => {
  return [
    <h2 key={0} className='step-content-title text-center'>Your community currency is ready to use!</h2>,
    <div key={1} className='step-content-summary'>
      <div className='step-content-summary-header'>
        <div className='step-content-summary-status'>
          <span className='step-content-summary-status-point' />
          not active
        </div>
        <button className='btn-reload'>
          <img src={CalculatorIcon} alt='calculator' />
        </button>
      </div>
      <div className='step-content-summary-container'>
        <div className='step-content-summary-logo'>
          <img src={communityLogo} className='logo-img' />
          <span className='symbol-text'>{communitySymbol}</span>
        </div>
        <div className='step-content-summary-title'>{communityName}</div>
        <div className='step-content-summary-footer'>
          <div className='step-content-summary-total-title'>Total cc supply</div>
          <div className='footer-supply'>
            <div className='step-content-summary-total'>
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0
              }).format(totalSupply)}
            </div>
            <div className='add-btn'>add cln <span className='add-icon'><FontAwesome name='plus' /></span></div>
          </div>
        </div>
      </div>
    </div>,
    <div key={3} className='text-center wallet-container'>
      <a href='https://metamask.io/' target='_blank' className='btn-download'>
        <FontAwesome name='download' /> Metamask wallet
      </a>
    </div>,
    <div key={4} className='text-center'>
      <button className='symbol-btn'>
        Done
      </button>
    </div>
  ]
}

export default SummaryStep
