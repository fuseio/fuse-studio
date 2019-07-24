import React, { useMemo } from 'react'
import { useTableState } from 'react-table'
import MyTable from 'components/dashboard/components/Table'

const TableContainer = ({ columns, data, addActionProps, loading, pageCount = 0 }) => {
  const myColumns = useMemo(() => columns, [columns])
  const state = useTableState({ pageCount })

  return (
    <MyTable
      {...{
        addActionProps,
        columns: myColumns,
        data,
        state,
        loading
      }}

    />
  )
}

export default TableContainer
