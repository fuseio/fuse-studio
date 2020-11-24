import React, { useState, useEffect } from 'react'
import isArray from 'lodash/isArray'

export default ({
  row,
  index,
  style = {},
  justAdded
}) => {
  if (!row) {
    return (
      <div>
        <span>Loading more...</span>
      </div>
    )
  }

  const [hasNewOne, setNewOne] = useState(false)

  useEffect(() => {
    if (justAdded) {
      setNewOne(true)
      setTimeout(() => {
        setNewOne(false)
      }, 5000)
    }
    return () => { }
  }, [justAdded])

  const className = index === 0 && hasNewOne
    ? 'table__body__row grid-x align-middle align-spaced table__body__row--just-added'
    : 'table__body__row grid-x align-middle align-spaced'

  return (
    <div {...row.getRowProps({ style, className })}>
      {row.cells.map(cell => {
        const { column: { id }, value } = cell
        const className = id === 'checkbox' || id === 'dropdown' ? `table__body__cell cell small-2` : `table__body__cell cell small-${Math.ceil(24 / row.cells.length)}`
        if (id === 'name' && isArray(value)) {
          return (
            <div {...cell.getCellProps({ className, style: { display: 'flex', alignItems: 'center', position: 'relative', height: '100%' } })}>
              <div
                style={{
                  position: 'absolute',
                  left: '-50px',
                  width: '36px',
                  height: '36px',
                  maxHeight: '36px',
                  maxWidth: '36px'
                }}
              >
                {value[0].image}
              </div>
              {value[0].name}
            </div>
          )
        }
        if (id === 'limits' || id === 'fee') {
          return (
            <div {...cell.getCellProps({ className })}>
              {value}
            </div>
          )
        }
        return (
          <div {...cell.getCellProps({ className })}>
            {cell.render('Cell')}
          </div>
        )
      })}
    </div>
  )
}
