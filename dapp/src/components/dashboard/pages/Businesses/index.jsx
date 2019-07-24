import React, { Fragment, useEffect, useState, useMemo } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Loader from 'components/common/Loader'
import { getAccountAddress } from 'selectors/accounts'
import { REQUEST, PENDING } from 'actions/constants'
import { getBusinessesEntities } from 'selectors/entities'
import {
  addEntity,
  fetchBusinessesEntities,
  removeEntity
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_DIRECTORY_ENTITY } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'
import TableContainer from 'components/dashboard/components/TableContainer'
import AddBusiness from 'images/add_business.svg'
import { useFetch } from 'hooks/useFetch'
import { getApiRoot } from 'utils/network'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'

const Businesses = ({
  network,
  businesses,
  community,
  isAdmin,
  history,
  fetchEntities,
  accountAddress,
  signatureNeeded,
  transactionStatus,
  onlyOnFuse,
  fetchBusinessesEntities,
  loadModal,
  addEntity,
  removeEntity
}) => {
  const { communityAddress, isClosed } = community
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const apiRoot = getApiRoot(network.networkType === 'fuse' ? 'default' : network.networkType)
  let url = `${apiRoot}/entities/${communityAddress}?type=business`

  if (search) {
    url = `${url}&search=${search}`
  }

  const [response, loading, fetchData] = useFetch(url, { verb: 'get' })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (fetchEntities === false) {
      fetchData()
    }

    if (search) {
      fetchData()
    }
  }, [search, fetchEntities])

  useEffect(() => {
    if (communityAddress) {
      fetchBusinessesEntities(communityAddress)
    }
  }, [communityAddress])

  useEffect(() => {
    if (!isEmpty(response)) {
      const { data: listData } = response
      setData(sortBy(listData.map(({ profile, isAdmin, isApproved, account }, index) => ({
        name: profile && profile.publicData ? profile.publicData.name : '',
        type: profile && profile.publicData ? profile.publicData.type : '',
        address: profile && profile.publicData ? profile.publicData.address : '',
        account,
        status: isAdmin
          ? 'Community admin'
          : isApproved
            ? 'Community user'
            : 'Pending user'
      })), ['updatedAt']).reverse())
    }
  }, [response])

  const columns = useMemo(() => [
    {
      id: 'checkbox',
      accessor: '',
      Cell: (rowInfo) => {
        return null
        // return (
        //   <input
        //     type='checkbox'
        //     className='row_checkbox'
        //     checked={rowInfo.value.checkbox}
        //     // checked={this.state.selected[rowInfo.original.title.props.children] === true}
        //     onChange={() => this.toggleRow(rowInfo.row.original)}
        //   />
        // )
      }
    },
    {
      Header: 'Name',
      accessor: 'name'
    },
    {
      Header: 'Type',
      accessor: 'type'
    },
    {
      Header: 'Address',
      accessor: 'address'
    },
    {
      Header: 'Account ID',
      accessor: 'account'
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        return (
          <div className='table__body__cell__more'>
            <div className='table__body__cell__more__toggler'><FontAwesome name='ellipsis-v' /></div>
            <div className='more' onClick={e => e.stopPropagation()}>
              <ul className='more__options'>
                <li className='more__options__item' onClick={() => handleRemoveEntity(rowInfo.row.original.account)}>
                  <FontAwesome name='trash' /> Remove from list
                </li>
              </ul>
            </div>
          </div>
        )
      }
    }
  ], [])

  const handleAddBusiness = () => onlyOnFuse(loadAddingModal)

  const loadAddingModal = () => loadModal(ADD_DIRECTORY_ENTITY, {
    submitEntity: (data) => addEntity(communityAddress, { ...data }, isClosed, 'business')
  })

  const renderTransactionStatus = () => {
    if (signatureNeeded || transactionStatus === PENDING || fetchEntities) {
      return (
        <div className='entities__loader'>
          <Loader color='#3a3269' className='loader' />
        </div>
      )
    }
  }

  const handleRemoveEntity = (account) =>
    onlyOnFuse(() => removeEntity(communityAddress, account))

  // const toggleRow = (rowData) => {
  //   const checkbox = data.find(({ account }) => account === rowData.account).checkbox
  //   data.find(({ account }) => account === rowData.account).checkbox = !checkbox
  //   setData([...data])
  // }

  const renderTable = () => {
    if (!data) return null
    return (
      <TableContainer
        addActionProps={{
          placeholder: 'Search a business',
          action: handleAddBusiness,
          isAdmin,
          text: 'Add business',
          onChange: setSearch
        }}
        data={data}
        loading={loading}
        columns={columns}
        pageCount={response && response.pageCount ? response.pageCount : 0}
      />
    )
  }

  const renderContent = () => {
    if (businesses && businesses.length) {
      return (
        <Fragment>
          {renderTable()}
        </Fragment>
      )
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <div className='entities__empty-list__title'>Add a business to your List!</div>
          <button
            className='entities__empty-list__btn'
            onClick={handleAddBusiness}
            disabled={transactionStatus === REQUEST || transactionStatus === PENDING}
          >
            Add business
          </button>
        </div>
      )
    }
  }

  return (
    <Fragment>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Businesses list</h2>
      </div>
      <div className='entities__wrapper'>
        {renderContent()}
      </div>
    </Fragment >
  )
}

const mapStateToProps = (state) => ({
  network: state.network,
  businesses: getBusinessesEntities(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  metadata: state.entities.metadata
})

const mapDispatchToProps = {
  addEntity,
  removeEntity,
  loadModal,
  hideModal,
  fetchBusinessesEntities
}

export default connect(mapStateToProps, mapDispatchToProps)(Businesses)
