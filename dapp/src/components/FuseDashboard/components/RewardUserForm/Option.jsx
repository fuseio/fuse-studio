import React, { Fragment, useMemo, useState } from 'react'
import { getIn, Field, useFormikContext } from 'formik'
import HeaderRow from 'components/FuseDashboard/components/HeaderRow'
import BodyRow from 'components/FuseDashboard/components/BodyRow'
import { useTable, useSortBy, useRowSelect } from 'react-table'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'

const options = (values) => {
  const joinBonus = getIn(values, 'joinBonus')
  const inviteBonus = getIn(values, 'inviteBonus')
  const backupBonus = getIn(values, 'backupBonus')
  return [
    {
      bonusName: 'Join bonus',
      tooltipText: 'Reward users for becoming a part of your economy.',
      key: 'joinBonus',
      amount: joinBonus && joinBonus.amount,
      isActive: (joinBonus && joinBonus.isActive)
    },
    {
      bonusName: 'Backup bonus',
      tooltipText: 'Reward users for backing up their wallet. This helps educates them on how to keep their funds secure.',
      key: 'backupBonus',
      amount: backupBonus && backupBonus.amount,
      isActive: (backupBonus && backupBonus.isActive)
    },
    {
      bonusName: 'Invite Bonus',
      tooltipText: 'Reward users for inviting their friends to participate in your economy. Once they send a translation to a new wallet they will receive the bonus.',
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
    <Field name={fieldName}>
      {({ field, form: { handleChange, submitForm } }) => {
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
    </Field>
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
      <Field name={fieldName}>
        {({ field, form: { setFieldValue, submitForm } }) => {
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
      </Field>
    )
  }
)

const TableOptions = ({ data, columns, updateMyData }) => {
  const formik = useFormikContext()
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
}

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
      accessor: 'bonusName',
      Cell: ({ cell: { value }, row: { original: { tooltipText } } }) => (
        <Fragment>
          {value}
          &nbsp;<FontAwesome data-tip data-for={value} name='info-circle' />
          <ReactTooltip className='tooltip__content' id={value} place='bottom' effect='solid'>
            <div>{tooltipText}</div>
          </ReactTooltip>
        </Fragment>
      )
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
