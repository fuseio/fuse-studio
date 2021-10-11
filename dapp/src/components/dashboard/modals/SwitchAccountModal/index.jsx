import React from "react";
import Modal from "components/common/Modal";

const SwitchAccountsModal = ({ hideModal, hasCloseBtn = true }) => {
  <Modal
    className="generic-modal"
    onClose={hideModal}
    hasCloseBtn={hasCloseBtn}
  >
    <div className="generic-modal__container">
      <div className="generic-modal__title">Wrong account</div>
      <div className="generic-modal__text">
        Can't perform an economy action! Please switch your Metamask account to:{" "}
        <b>{content.account}</b>
      </div>
      <button className="generic-modal__button" onClick={hideModal}>
        Close
      </button>
    </div>
  </Modal>;
};

export default SwitchAccountsModal;
