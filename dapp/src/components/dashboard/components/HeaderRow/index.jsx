import React from 'react'
import FontAwesome from 'react-fontawesome'

export default ({
  headerGroup
}) => {
  return (
    <div {...headerGroup.getRowProps({ className: 'table__header grid-x align-middle align-spaced' })}>
      {headerGroup.headers.map(column => {
        const { id } = column
        const className = id === 'checkbox' || id === 'dropdown' ? `table__body__cell cell small-2` : `table__body__cell cell small-${Math.ceil(24 / headerGroup.headers.length)}`
        return (
          <div {...column.getHeaderProps({ className })}>
            <span {...column.getSortByToggleProps()}>
              {column.render('Header')}
            </span>
            <span className='table__header__cell__sort'>
              {column.sorted
                ? (column.sortedDesc
                  ? <FontAwesome name='arrow-down' />
                  : <FontAwesome name='arrow-up' />)
                : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
