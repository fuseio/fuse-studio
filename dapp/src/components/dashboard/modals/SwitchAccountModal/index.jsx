import React from 'react'
import Modal from 'components/common/Modal'
import { addressShortener } from 'utils/format'

const SwitchAccountModal = ({ community, user, owner, hideModal }) => {
  return (
    <Modal className='entity_added' onClose={hideModal} hasCloseBtn>
      <div className='entity_added__title'>
        Can't perform economy action!
      </div>
      <div className='entity_added__body'>
        <span>The community {community} can't perform plug-in action using wallet address: {addressShortener(user)}</span>
       <span>Please, switch to following {addressShortener(owner)} using your Metamask and try again.</span>
       <br />
       <button onClick={hideModal}>Close</button>
      </div>
    </Modal>
  )
}

export default SwitchAccountModal