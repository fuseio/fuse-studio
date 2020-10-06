import React, { useMemo, useState } from 'react'
import { connect, getIn, Field } from 'formik'
import HeaderRow from 'components/dashboard/components/HeaderRow'
import BodyRow from 'components/dashboard/components/BodyRow'
import { useTable, useSortBy, useRowSelect } from 'react-table'

const options = (values) => {
  const joinBonus = getIn(values, 'joinBonus')
  const inviteBonus = getIn(values, 'inviteBonus')
  const backupBonus = getIn(values, 'backupBonus')
  return [
    {
      name: [
        {
          name: 'Join bonus'
        }
      ],
      key: 'joinBonus',
      amount: joinBonus && joinBonus.amount,
      isActive: (joinBonus && joinBonus.isActive)
    },
    {
      name: [
        {
          name: 'Backup bonus'
        }
      ],
      key: 'backupBonus',
      amount: backupBonus && backupBonus.amount,
      isActive: (backupBonus && backupBonus.isActive)
    },
    {
      name: [
        {
          name: 'Invite Bonus'
        }
      ],
      key: 'inviteBonus',
      amount: inviteBonus && inviteBonus.amount,
      isActive: (inviteBonus && inviteBonus.isActive)
    }
  ]
}

const EditableCell = ({
  row,
  column,
  updateMyData
}) => {
  const { id } = column
  const { index, original: { key, amount } } = row
  const fieldName = `${key}.amount`
  const [value, setValue] = React.useState(amount)
  React.useEffect(() => {
    setValue(amount)
  }, [amount])

  return (
    <Field
      name={fieldName}
      render={({ field, form: { handleChange, submitForm } }) => {
        const { onBlur } = field
        return (
          <div className='grid-x align-middle'>
            <input
              {...field}
              id={fieldName}
              type='number'
              onBlur={(e) => {
                onBlur(e)
                updateMyData(index, id, value)
              }}
              onChange={e => {
                setValue(e.target.value)
                handleChange(e)
                setTimeout(submitForm, 3)
              }}
            />
          </div>
        )
      }}
    />
  )
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, fieldName, updateMyData, index, id, isActive, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef
    const [value, setIsActive] = React.useState(isActive)
    React.useEffect(() => {
      setIsActive(isActive)
    }, [isActive])

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <Field
        name={fieldName}
        render={({ field, form: { setFieldValue, submitForm } }) => {
          return (
            <div className='grid-x align-middle'>
              <label className='toggle' htmlFor={fieldName}>
                <input
                  ref={resolvedRef}
                  {...rest}
                  {...field}
                  id={fieldName}
                  type='checkbox'
                  onChange={e => {
                    setIsActive(!value)
                    setFieldValue(fieldName, !value)
                    updateMyData(index, id, value)
                    setTimeout(submitForm, 3)
                  }}
                />
                <div className='toggle-wrapper'>
                  <span className='toggle' />
                </div>
              </label>
            </div>
          )
        }}
      />
    )
  }
)

const TableOptions = connect(({ formik, data, columns, updateMyData }) => {
  const joinBonus = getIn(formik.values, 'joinBonus')
  const inviteBonus = getIn(formik.values, 'inviteBonus')
  const backupBonus = getIn(formik.values, 'backupBonus')

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
      updateMyData,
      initialState: {
        pageCount: 0,
        pageSize: 3,
        selectedRowIds: {
          0: joinBonus && joinBonus.isActive,
          1: backupBonus && backupBonus.isActive,
          2: inviteBonus && inviteBonus.isActive
        }
      }
    },
    useSortBy,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'checkbox',
          Cell: ({ row, column }) => {
            const { id } = column
            const { original: { key, isActive }, index } = row
            const fieldName = `${key}.isActive`
            return (
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                index={index}
                id={id}
                isActive={isActive}
                fieldName={fieldName}
                updateMyData={updateMyData}
              />
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

const OptionsContainer = ({ values }) => {
  const [data, setData] = useState(options(values))
  const updateMyData = (rowIndex, columnId, value) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value
          }
        }
        return row
      })
    )
  }

  const columns = useMemo(() => [
    {
      Header: 'Reward name',
      accessor: 'name'
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: EditableCell
    }
  ], [])

  return (
    <TableOptions data={data} columns={columns} updateMyData={updateMyData} />
  )
}

export default OptionsContainer
