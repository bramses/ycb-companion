/*
<Modal
        isOpen={isUploaderModalOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        ariaHideApp={false}
        // apply custom styles using tailwind classes
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
      >
        <button onClick={closeModal} type="button">
          (close)
        </button>
        <h2
          className="mb-4 text-2xl font-semibold text-gray-800"
          id="modal-title"
        >
          Fast Entry
        </h2>
        <Uploader />
      </Modal>
*/

/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

import Modal from 'react-modal';

import Uploader from './Uploader';

const UploaderModal = ({
  isOpen,
  closeModalFn,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Example Modal"
      ariaHideApp={false}
      // apply custom styles using tailwind classes
      className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
    >
      <button onClick={closeModalFn} type="button">
        (close)
      </button>
      <h2
        className="mb-4 text-2xl font-semibold text-gray-800"
        id="modal-title"
      >
        Fast Entry
      </h2>
      <Uploader
        closeModal={closeModalFn}
        textDefault=""
        titleDefault=""
        authorDefault="https://yourcommonbase.com/dashboard"
      />
    </Modal>
  );
};

export default UploaderModal;
