import Modal from 'react-modal';

const LinksModal = ({
  isOpen,
  closeModalFn,
  onSave,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  onSave: (name: string, url: string) => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Edit Modal"
      ariaHideApp={false}
      className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
    >
      <button onClick={closeModalFn} type="button">
        (close)
      </button>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Add a Link:</h2>
      <input
        id="link-name"
        type="text"
        style={{ fontSize: '17px' }}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Name"
      />
      <input
        id="link-url"
        type="text"
        style={{ fontSize: '17px' }}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="URL"
      />

      <div className="flex space-x-2">
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={() => {
            const name = (
              document.getElementById('link-name') as HTMLInputElement
            ).value;
            const url = (
              document.getElementById('link-url') as HTMLInputElement
            ).value;
            if (!name || !url) {
              return;
            }

            // send data to parent
            onSave(name, url);
            closeModalFn();
          }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default LinksModal;
