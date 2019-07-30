import React, { useMemo } from 'react'
import { useTableState } from 'react-table'
import MyTable from 'components/dashboard/components/Table'

const TableContainer = ({ columns, data, addActionProps, loading, justAdded, pageCount = 0 }) => {
  const state = useTableState({ pageCount })

  return (
    <MyTable
      {...{
        addActionProps,
        columns,
        data,
        state,
        loading,
        justAdded
      }}

    />
  )
}

export default TableContainer
