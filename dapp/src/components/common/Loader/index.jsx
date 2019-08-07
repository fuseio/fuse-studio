import React from 'react'

const Loader = ({ color = '#7b7b7b', className }) => {
  return (
    <svg
      className={className}
      version='1.1'
      viewBox='0 0 256 16'
      xmlSpace='preserve'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
    >
      <circle fill={color} cx='67.6' cy='4' r='9.6'>
        <animate
          attributeName='opacity'
          dur='1s'
          values='0;1;0'
          repeatCount='indefinite'
          begin='0.1' />
      </circle>
      <circle fill={color} cx='128' cy='4' r='9.6'>
        <animate
          attributeName='opacity'
          dur='1s'
          values='0;1;0'
          repeatCount='indefinite'
          begin='0.2' />
      </circle>
      <circle fill={color} cx='188.4' cy='4' r='9.6'>
        <animate
          attributeName='opacity'
          dur='1s'
          values='0;1;0'
          repeatCount='indefinite'
          begin='0.3' />
      </circle>
    </svg>
  )
}

export default Loader
