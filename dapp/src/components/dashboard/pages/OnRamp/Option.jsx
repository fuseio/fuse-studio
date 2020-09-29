import React, { useMemo } from 'react'
import { connect, getIn, Field } from 'formik'
import MyTable from 'components/dashboard/components/Table'

const Option = connect(({ formik }) => {
  const isOpen = getIn(formik.values, 'isOpen')
  return (
    <div>

    </div>
  )
})

const Options = ({ formik }) => {
  const plugin = getIn(formik.values, 'plugin')
  const columns = useMemo(() => [
    // {
    //   id: 'checkbox',
    //   accessor: '',
    //   Cell: (rowInfo) => {
    //     return null
    //     // return (
    //     //   <input
    //     //     type='checkbox'
    //     //     className='row_checkbox'
    //     //     checked={rowInfo.value.checkbox}
    //     //     // checked={this.state.selected[rowInfo.original.title.props.children] === true}
    //     //     onChange={() => this.toggleRow(rowInfo.row.original)}
    //     //   />
    //     // )
    //   }
    // },
    {
      Header: 'Service name',
      accessor: 'name'
    },
    // {
    //   Header: 'Fees',
    //   accessor: 'fee'
    // },
    // {
    //   Header: 'Countries',
    //   accessor: 'countries'
    // }
  ], [])

  const tableData = useMemo(() => [
    // {
    //   id: 'checkbox',
    //   accessor: '',
    //   Cell: (rowInfo) => {
    //     return null
    //     // return (
    //     //   <input
    //     //     type='checkbox'
    //     //     className='row_checkbox'
    //     //     checked={rowInfo.value.checkbox}
    //     //     // checked={this.state.selected[rowInfo.original.title.props.children] === true}
    //     //     onChange={() => this.toggleRow(rowInfo.row.original)}
    //     //   />
    //     // )
    //   }
    // },
    {
      Header: 'Service name',
      accessor: 'name'
    },
    // {
    //   Header: 'Fees',
    //   accessor: 'fee'
    // },
    // {
    //   Header: 'Countries',
    //   accessor: 'countries'
    // }
  ], [])
  return (
    <MyTable
      data={tableData}
      columns={columns}
    />
  )
}

export default connect(Options)
