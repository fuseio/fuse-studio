import React, { useReducer, Children } from 'react'
import classNames from 'classnames'
import { Swipeable } from 'react-swipeable'

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

export default ({ children, showProgress = true }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const numItems = Children.count(children)

  const slide = dir => {
    dispatch({ type: dir, numItems })
    setTimeout(() => {
      dispatch({ type: 'stopSliding' })
    }, 50)
  }

  const config = {
    onSwipedLeft: () => slide(PREV),
    onSwipedRight: () => slide(NEXT),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    rotationAngle: 180
  }

  const check = () => {
    const { sliding, dir } = state

    if (!sliding) {
      return 'translateX(calc(30% - 20px))'
    }

    if (dir === PREV) {
      return 'translateX(calc(2 * (-30% - 20px)))'
    }
    return 'translateX(0%)'
  }

  return (
    <Swipeable {...config} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          transition: state.sliding ? 'none' : 'transform 1s ease',
          transform: check()
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            style={{
              flexBasis: '30%',
              marginRight: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
          <div className='attributes__progress'>
            {
              Children.map(children, (item, index) => {
                const classes = classNames('attributes__progress__item', {
                  'attributes__progress__item--active': index === state.pos
                })
                return (
                  <span key={item} className={classes} />
                )
              })
            }
          </div>
        )
      }
    </Swipeable>
  )
}
