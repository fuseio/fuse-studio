import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { formatAddress } from 'utils/format'

export default ({
  row,
  index,
  style = {},
  prepareRow
}) => {
  if (!row) {
    return (
      <div>
        <span>Loading more...</span>
      </div>
    )
  }

  prepareRow(row)
  return (
    <div {...row.getRowProps({ style, className: 'table__body__row grid-x align-middle align-spaced' })}>
      {row.cells.map(cell => {
        const { column: { id }, value } = cell
        const className = id === 'checkbox' || id === 'dropdown' ? `table__body__cell cell small-2` : `table__body__cell cell small-${Math.ceil(24 / row.cells.length)}`
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
