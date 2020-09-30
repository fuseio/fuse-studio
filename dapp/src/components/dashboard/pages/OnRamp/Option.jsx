import React, { useMemo } from 'react'
import { connect, getIn, Field } from 'formik'
import HeaderRow from 'components/dashboard/components/HeaderRow'
import BodyRow from 'components/dashboard/components/BodyRow'
import { useTable, useSortBy, useRowSelect } from 'react-table'
import pluginsIcons from 'constants/pluginsIcons'
import get from 'lodash/get'

const getPluginName = (myPlugins) => {
  const isMoonpay = get(myPlugins, 'moonpay.isActive', false)
  const isTransak = get(myPlugins, 'transak.isActive', false)
  const isRampInstant = get(myPlugins, 'rampInstant.isActive', false)
  return isTransak ? 'transak' : isMoonpay ? 'moonpay' : isRampInstant ? 'rampInstant' : null
}

const options = (plugin) => [
  {
    name: [
      {
        name: 'Moonpay',
        image: <div
          style={{
            backgroundImage: `url(${pluginsIcons['moonpay']})`,
            width: '36px',
            height: '36px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      }
    ],
    fee: '0.0',
    countries: 'sdadada',
    value: 'moonpay',
    isSelected: plugin === 'moonpay'
  },
  {
    name: [
      {
        name: 'Transak',
        image: <div
          style={{
            backgroundImage: `url(${pluginsIcons['transak']})`,
            width: '36px',
            height: '36px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      }
    ],
    fee: '0.0',
    countries: 'sdadada',
    value: 'transak',
    isSelected: plugin === 'transak'
  },
  // {
  //   name: [
  //     {
  //       name: 'Ramp.network',
  //       image: <div
  //         style={{
  //           backgroundImage: `url(${pluginsIcons['transak']})`,
  //           width: '36px',
  //           height: '36px',
  //           backgroundSize: 'contain',
  //           backgroundRepeat: 'no-repeat',
  //           backgroundPosition: 'center'
  //         }}
  //       />
  //     }
  //   ],
  //   fee: '0.0',
  //   countries: 'sdadada',
  //   value: 'rampInstant',
  //   isSelected: plugin === 'rampInstant'
  // },
]

const TableOptions = connect(({ formik, data, columns }) => {
  const plugin = getIn(formik.values, 'plugin')
  const isMoonpay = plugin === 'moonpay'
  const isTransak = plugin === 'transak'
  const isRampInstant = plugin === 'rampInstant'

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows
  } = useTable(
    {
      autoResetSelectedRows: true,
      columns,
      data,
      initialState: {
        pageCount: 0,
        pageSize: 3,
        selectedRowIds: {
          0: isMoonpay,
          1: isTransak,
          2: isRampInstant
        }
      }
    },
    useSortBy,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'checkbox',
          Cell: ({ row }) => {
            const { original: { value } } = row
            const { onChange, ...rest } = row.getToggleRowSelectedProps()
            return (
              <React.Fragment>
                <Field
                  name='plugin'
                  render={({ field, form: { setFieldValue } }) => (
                    <input
                      className='row_checkbox'
                      {...field}
                      {...rest}
                      type='radio'
                      value={value}
                      id={value}
                      onChange={(e) => {
                        onChange(e)
                        setFieldValue('plugin', e.target.value)
                        setTimeout(formik.submitForm, 3)
                      }} />
                  )}
                />
                <label className='label' htmlFor={value} />
                <div className='check' />
              </React.Fragment >
            )
          }
        },
        ...columns
      ])
    }
  )

  return (
    <div {...getTableProps({ className: 'table' })}>
      {headerGroups.map((headerGroup, index) => <HeaderRow key={index} headerGroup={headerGroup} />)}
      <div className='table__body'>
        <div {...getTableBodyProps()}>
          {rows && rows.length && rows.map((row, i) => prepareRow(row) || <BodyRow key={i} row={row} index={i} />)}
        </div>
      </div>
    </div>
  )
})

const OptionsContainer = ({ myPlugins }) => {
  const data = useMemo(() => getPluginName(myPlugins) ? options(getPluginName(myPlugins)) : options(''), [myPlugins])

  const columns = useMemo(() => [
    {
      Header: 'Service name',
      accessor: 'name'
    },
    {
      Header: 'Fees',
      accessor: 'fee'
    },
    {
      Header: 'Countries',
      accessor: 'countries'
    }
  ], [])

  return (
    <TableOptions data={data} columns={columns} />
  )
}

export default OptionsContainer
