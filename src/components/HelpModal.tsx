import React, { useState } from 'react';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';

interface Instruction {
  img?: string;
  text: string;
}

interface Button {
  label: string;
  handler: () => void;
}

const HelpModal = ({
  isOpen,
  closeModalFn,
  instructions,
  stepButtons,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  instructions: Instruction[];
  stepButtons: Button[];
}) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Help Modal"
      ariaHideApp={false}
    >
      <button onClick={closeModalFn} type="button">
        (close)
      </button>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Instructions</h2>
      <div>
        {instructions.map((instruction, index) => (
          <div key={uuidv4()}>
            <button
              onClick={() => toggleOpen(index)}
              className="w-full text-left"
              type="button"
            >
              Step {index + 1}
            </button>
            {openIndex === index && (
              <div className="pl-4">
                {instruction.img && (
                  <img src={instruction.img} alt={`Step ${index + 1}`} />
                )}
                <p>{instruction.text}</p>
                <div>
                  {stepButtons[index] && stepButtons[index] !== null && (
                    <button
                      key={uuidv4()} // Ensure the key is unique, using index here
                      onClick={stepButtons[index].handler}
                      type="button"
                    >
                      {stepButtons[index].label}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default HelpModal;
