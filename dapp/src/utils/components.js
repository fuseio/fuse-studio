import React from 'react'

export const withEither = (conditionalRenderingFn, EitherComponent) => (Component) => (props) =>
  conditionalRenderingFn(props)
    ? <EitherComponent {...props} />
    : <Component {...props} />

export const withNeither = (conditionalRenderingFn, EitherComponent) => (Component) => (props) =>
  !conditionalRenderingFn(props)
    ? <EitherComponent {...props} />
    : <Component {...props} />

export const withMaybe = (conditionalRenderingFn) => (Component) => (props) => {
  console.log({ test: conditionalRenderingFn(props) })
  return conditionalRenderingFn(props)
    ? <Component {...props} />
    : null
}
