import React from 'react'
import { useTable, usePagination, useSortBy } from 'react-table'
import BodyRow from 'components/FuseDashboard/components/BodyRow'
import HeaderRow from 'components/FuseDashboard/components/HeaderRow'
import FontAwesome from 'react-fontawesome'

const MyTable = ({
  columns,
  data,
  addActionProps,
  loading,
  justAdded,
  count,
  size
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageOptions,
    gotoPage,
    state: { pageIndex, pageSize }
    // canPreviousPage,
    // canNextPage,
    // pageCount,
    // nextPage,
    // previousPage,
    // setPageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageCount: count, pageSize: size }
    },
    useSortBy,
    usePagination
  )

  return (
    <div className='table__wrapper'>
      {
        addActionProps && (
          <div className='table__actions'>
            <div className='table__actions__search'>
              <FontAwesome name='search' className='table__actions__search__icon' />
              <input type='text' onChange={(e) => addActionProps.onChange(e.target.value)} placeholder={addActionProps.placeholder} className='table__actions__search__input' />
            </div>
            {
              addActionProps && addActionProps.action && addActionProps.text && (
                <button
                  className='table__actions__button'
                  onClick={addActionProps.action}
                >
                  <FontAwesome name='plus-circle' style={{ color: 'white', marginRight: '5px' }} />
                  {addActionProps.text}
                </button>
              )
            }
          </div>
        )
      }
      <div {...getTableProps({ className: 'table' })}>
        {headerGroups.map((headerGroup, index) => <HeaderRow key={index} headerGroup={headerGroup} />)}
        <div className='table__body'>
          {
            loading ? (
              <div className='table__body__row grid-x align-middle align-spaced'>Loading...</div>
            ) : page && page.length ? <div {...getTableBodyProps()}>{page.map((row, i) => prepareRow(row) || <BodyRow key={i} justAdded={justAdded} row={row} index={i} />)}</div> : (
              <div className='table__body__row grid-x align-middle'>
                <div className='table__body__cell cell'>0 Total Records</div>
              </div>
            )
          }
        </div>
      </div>
      <div className='table__pagination__wrapper'>
        <div className='table__pagination'>
          <p>Rows per page: {pageSize}</p>
          <select
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
          >
            {
              pageOptions.map((page, index) => <option key={index} value={index + 1}>{index + 1}</option>)
            }
          </select>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MyTable)
