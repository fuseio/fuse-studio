import React, { PureComponent } from 'react'
import FontAwesome from 'react-fontawesome'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { getBlockExplorerUrl } from 'utils/network'
import classNames from 'classnames'

export default class Entity extends PureComponent {
  state = {
    isOpen: false
  }

  componentDidMount () {
    document.addEventListener('click', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.dropdownRef && !this.dropdownRef.contains(event.target)) {
      this.setState({ isOpen: false })
    }
  }

  setDropdownRef = (node) => {
    this.dropdownRef = node
  }

  render () {
    const {
      entity: {
        name,
        businessType,
        type,
        account,
        isAdmin,
        isApproved
      },
      showProfile,
      handleRemove,
      addAdminRole,
      removeAdminRole,
      confirmUser
    } = this.props

    const { isOpen } = this.state

    return (
      <div className='entities__entity'>
        <div className='entities__entity__logo' onClick={() => showProfile()}>
          <FontAwesome name='bullseye' />
        </div>
        <div className='entities__entity__content' onClick={() => showProfile()}>
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
        <div
          className='entities__entity__more'
          ref={this.setDropdownRef}
          onClick={(e) => {
            e.stopPropagation()
            this.setState({ isOpen: !isOpen })
          }}
        >
          <FontAwesome name='ellipsis-v' />
          <div className={classNames('more', { 'more--show': isOpen })} onClick={e => e.stopPropagation()}>
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
}
