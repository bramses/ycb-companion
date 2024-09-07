import Modal from 'react-modal';

const EditModal = ({
  isOpen,
  closeModalFn,
  data,
  metadata,
  onSave,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  data: any;
  metadata: any;
  onSave: (data: any, metadata: any) => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Edit Modal"
      ariaHideApp={false}
    >
      <textarea
        id="edit-modal-textarea"
        rows={4}
        style={{ fontSize: '17px' }}
        className="my-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      >
        {data}
      </textarea>
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="my-2">
          <label
            htmlFor={key}
            className="block text-sm font-medium text-gray-700"
          >
            {key}
          </label>
          <input
            id={key}
            type="text"
            style={{ fontSize: '17px' }}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            defaultValue={String(value)}
          />
        </div>
      ))}
      <div className="flex space-x-2">
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={() => {
            // get data from textarea and inputs
            const newData = (
              document.getElementById('edit-modal-textarea') as HTMLInputElement
            ).value;
            const newMetadata: any = {};
            Object.entries(metadata).forEach(([key]) => {
              const input = document.getElementById(key) as HTMLInputElement;
              newMetadata[key] = input.value;
            });
            // if data is empty, do not save
            if (!newData) {
              return;
            }
            // if no changes, do not save
            if (
              newData === data &&
              JSON.stringify(newMetadata) === JSON.stringify(metadata)
            ) {
              closeModalFn();
              return;
            }
            // if metadata.alias_ids exists and users empty it, return err
            if (newMetadata.alias_ids && newMetadata.alias_ids.length === 0) {
              console.error('alias_ids cannot be empty');
              return;
              // throw new Error('alias_ids cannot be empty');
            }
            // if metadata.alias_ids is not a correct array, do not save
            if (
              newMetadata.alias_ids &&
              !Array.isArray(newMetadata.alias_ids)
            ) {
              // try to parse it from comma-separated string
              try {
                newMetadata.alias_ids = newMetadata.alias_ids
                  .split(',')
                  .map((id: any) => id.trim());
              } catch (err) {
                console.error('Error parsing alias_ids:', err);
                return;
                // return;
                // throw new Error('Error parsing alias_ids');
              }
            }

            if (newMetadata.aliasData) {
              delete newMetadata.aliasData;
            }

            // send data to parent
            onSave(newData, newMetadata);
            closeModalFn();
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={closeModalFn}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default EditModal;
