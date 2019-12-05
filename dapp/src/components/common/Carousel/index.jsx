import React, { useReducer, Children } from 'react'
import classNames from 'classnames'
import { useSwipeable } from 'react-swipeable'

const NEXT = 'NEXT'
const PREV = 'PREV'

const initialState = { pos: 0, sliding: undefined, dir: NEXT }

function reducer (state, { type, numItems }) {
  switch (type) {
    case 'reset':
      return initialState
    case PREV:
      return {
        ...state,
        dir: PREV,
        sliding: true,
        pos: state.pos === 0 ? numItems - 1 : state.pos - 1
      }
    case NEXT:
      return {
        ...state,
        dir: NEXT,
        sliding: true,
        pos: state.pos === numItems - 1 ? 0 : state.pos + 1
      }
    case 'stopSliding':
      return { ...state, sliding: false }
    default:
      return state
  }
}

const getOrder = ({ index, pos, numItems }) => {
  return index - pos < 0 ? numItems - Math.abs(index - pos) : index - pos
}

const Carousel = ({ children, showProgress = true }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const numItems = Children.count(children)

  const slide = dir => {
    dispatch({ type: dir, numItems })
    setTimeout(() => {
      dispatch({ type: 'stopSliding' })
    }, 50)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => slide(NEXT),
    onSwipedRight: () => slide(PREV),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const getTransform = () => {
    const { sliding, dir } = state

    if (!sliding) {
      return 'translateX(calc(-26% - 20px))'
    }

    if (dir === PREV) {
      return 'translateX(calc(2 * (-26% - 20px)))'
    }

    return 'translateX(0%)'
  }

  return (
    <div {...handlers} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          transition: state.sliding ? 'none' : 'transform 1s ease',
          transform: getTransform()
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            style={{
              flex: '1 0 100%',
              flexBasis: '50%',
              margin: '0.6em',
              order: getOrder({ index: index, pos: state.pos, numItems })
            }}
            key={index}
          >
            {child}
          </div>
        ))}
      </div>
      {
        showProgress && (
          <div className='featured__carousel__progress'>
            {
              Children.map(children, (item, index) => {
                const classes = classNames('featured__carousel__progress__item', {
                  'featured__carousel__progress__item--active': index === state.pos
                })
                return (
                  <span key={item} className={classes} />
                )
              })
            }
          </div>
        )
      }
    </div>
  )
}

export default Carousel
