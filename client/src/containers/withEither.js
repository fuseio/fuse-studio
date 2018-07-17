import React from 'react'

const withEither = (conditionalRenderingFn, EitherComponent) => (Component) => (props) =>
  conditionalRenderingFn(props)
    ? <EitherComponent {...props} />
    : <Component {...props} />

export default withEither
