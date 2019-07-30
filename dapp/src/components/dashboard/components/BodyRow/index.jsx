import React, { useState, useEffect } from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { formatAddress } from 'utils/format'

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
  }, [justAdded])

  const className = index === 0 && hasNewOne
    ? 'table__body__row grid-x align-middle align-spaced table__body__row--just-added'
    : 'table__body__row grid-x align-middle align-spaced'

  return (
    <div {...row.getRowProps({ style, className })}>
      {row.cells.map(cell => {
        const { column: { id }, value } = cell
        const className = id === 'checkbox' || id === 'dropdown' ? `table__body__cell cell small-2` : `table__body__cell cell small-${Math.ceil(24 / row.cells.length)}`
        if (id === 'name') {
          return (
            <div {...cell.getCellProps({ className, style: { display: 'flex', alignItems: 'center' } })}>
              <div
                style={{
                  marginRight: '20px',
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
        return (
          <div {...cell.getCellProps({ className })}>
            {
              id === 'account'
                ? (
                  <React.Fragment>
                    {formatAddress(value)}
                    <CopyToClipboard text={value}>
                      <FontAwesome name='clone' />
                    </CopyToClipboard>
                  </React.Fragment>
                ) : (
                  cell.render('Cell')
                )
            }
          </div>
        )
      })}
    </div>
  )
}
