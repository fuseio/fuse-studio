import React from 'react'
import {
  useTable,
  useColumns,
  useRows,
  useGroupBy,
  useFilters,
  useSortBy,
  useExpanded,
  usePagination
} from 'react-table'
import BodyRow from 'components/dashboard/components/BodyRow'
import HeaderRow from 'components/dashboard/components/HeaderRow'
import FontAwesome from 'react-fontawesome'

const MyTable = ({
  columns,
  data,
  addActionProps,
  loading,
  state,
  ...props
}) => {
  const instance = useTable(
    {
      columns,
      data,
      state
    },
    useColumns,
    useRows,
    useGroupBy,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  )

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    headerGroups,
    // rows,
    // getRowProps,
    // pageOptions,
    page,
    state: [{ pageIndex, pageSize }],
    gotoPage,
    prepareRow,
    // previousPage,
    // nextPage,
    // setPageSize,
    // canPreviousPage,
    // canNextPage,
    pages
  } = instance

  return (
    <div className='table__wrapper'>
      <div className='table__actions'>
        <div className='table__actions__search'>
          <FontAwesome name='search' className='table__actions__search__icon' />
          <input type='text' onChange={(e) => addActionProps.onChange(e.target.value)} placeholder={addActionProps.placeholder} className='table__actions__search__input' />
        </div>
        {
          addActionProps.isAdmin && (
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
      <div {...getTableProps({ className: 'table' })}>
        {headerGroups.map((headerGroup, index) => <HeaderRow key={index} headerGroup={headerGroup} />)}
        <div className='table__body'>
          {
            loading ? (
              <div className='table__body__row grid-x align-middle align-spaced'>Loading...</div>
            ) : page && page.length ? page.map((row, i) => <BodyRow key={i} row={row} index={i} prepareRow={prepareRow} />) : (
              <div className='table__body__row grid-x align-middle'>
                <div className='table__body__cell cell'>0 Total Records</div>
              </div>
            )
          }
          {/* {page && page.length ? page.map((row, i) => <BodyRow row={row} index={i} prepareRow={prepareRow} />) : null} */}
        </div>
      </div>
      <div className='table__pagination__wrapper'>
        <div className='table__pagination'>
          <p>Rows per page:</p>
          <select
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
          >
            {
              pages.map((page, index) => <option key={index} value={index + 1}>{index + 1}</option>)
            }
          </select>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MyTable)
