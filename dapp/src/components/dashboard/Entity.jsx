import React from 'react'
import FontAwesome from 'react-fontawesome'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { getBlockExplorerUrl } from 'utils/network'

const Entity = ({
  entity: {
    name,
    businessType,
    type,
    account,
    active,
    isAdmin,
    isApproved
  },
  address,
  showProfile,
  handleRemove,
  addAdminRole,
  removeAdminRole,
  confirmUser
}) => {
  return (
    <div className='entities__entity' onClick={() => showProfile()}>
      <div className='entities__entity__logo'>
        <FontAwesome name='bullseye' />
      </div>
      <div className='entities__entity__content'>
        <span className='entities__entity__content__title'>{name || ' '}</span>
        {businessType && <div className='entities__entity__content__type'>{businessType}</div>}
        <div className='entities__entity__content__subtitle'>
          <span className='text-asset'>Account ID</span>
          <a onClick={e => e.stopPropagation()} href={`${getBlockExplorerUrl('fuse')}/address/${account}`} target='_blank'>
            <span className='id'>{account}</span>
          </a>
          <CopyToClipboard text={account}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </div>
      </div>
      <div className='entities__entity__more'>
        <FontAwesome name='ellipsis-v' />
        <div className='more' onClick={e => e.stopPropagation()}>
          {
            type === 'business' && (
              <ul className='more__options'>
                <li className='more__options__item' onClick={() => handleRemove(account)}>Remove</li>
              </ul>
            )
          }
          {
            type === 'user' && isApproved && !isAdmin && (
              <ul className='more__options'>
                <li className='more__options__item' onClick={() => handleRemove(account)}>Remove</li>
                <li className='more__options__item' onClick={() => addAdminRole(account)}>Make admin</li>
              </ul>
            )
          }
          {
            type === 'user' && isAdmin && isApproved && (
              <ul className='more__options'>
                <li className='more__options__item' onClick={() => handleRemove(account)}>Remove</li>
                <li className='more__options__item' onClick={() => removeAdminRole(account)}>Remove as admin</li>
              </ul>
            )
          }
          {
            type === 'user' && !isApproved && !isAdmin && (
              <ul className='more__options'>
                <li className='more__options__item' onClick={() => confirmUser(account)}>Confirm</li>
                <li className='more__options__item' onClick={() => addAdminRole(account)}>Make admin</li>
              </ul>
            )
          }
        </div>
      </div>
    </div>

  )
}
export default Entity
