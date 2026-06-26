import React from 'react';
import { MdPerson, MdLocalShipping } from 'react-icons/md';

const ModeSelectionModal = ({ onSelect, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
        <h2 className="font-black text-2xl uppercase text-center mb-2 border-b-4 border-black pb-3">
          Choose Your Mode
        </h2>
        <p className="font-bold text-sm text-center mb-6 text-gray-600">
          What would you like to track?
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => onSelect('simple')}
            disabled={loading}
            className="flex flex-col items-center p-4 border-4 border-black bg-yellow-400 hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            <MdPerson className="text-4xl mb-2" />
            <span className="font-black text-sm uppercase">Personal</span>
            <span className="font-bold text-xs text-gray-600 mt-1">Daily expenses</span>
          </button>

          <button
            onClick={() => onSelect('transport')}
            disabled={loading}
            className="flex flex-col items-center p-4 border-4 border-black bg-yellow-400 hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            <MdLocalShipping className="text-4xl mb-2" />
            <span className="font-black text-sm uppercase">Transport</span>
            <span className="font-bold text-xs text-gray-600 mt-1">Trips & fuel</span>
          </button>
        </div>

        {loading && (
          <p className="text-center font-bold text-sm animate-pulse">Setting up your account...</p>
        )}
      </div>
    </div>
  );
};

export default ModeSelectionModal;
