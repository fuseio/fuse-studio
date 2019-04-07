import React, { Fragment, useState } from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard'

const styles = {
  position: 'fixed',
  width: '100px',
  height: '40px',
  padding: '11px',
  background: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '4px',
  color: '#fff',
  marginLeft: '-50px',
  textAlign: 'center',
  left: '50%',
  fontSize: '14px',
  animation: 'ani1 1s alternate infinite'
}

export default ({ text, children }) => {
  const [copyStatus, setState] = useState('')

  const handleClick = (e) => {
    e.stopPropagation()
    setState('Copied!')
    setTimeout(() => {
      setState('')
    }, 2000)
  }

  return (
    <Fragment>
      <CopyToClipboard text={text}>
        <div onClick={handleClick} style={{display: 'inline-block'}}>
          {children}
        </div>
      </CopyToClipboard>
      {
        copyStatus && <div style={styles}>
          {copyStatus}
        </div>
      }
    </Fragment>
  )
}
