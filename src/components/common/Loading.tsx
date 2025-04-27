import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#DFF5E1]"></div>
        <div className="w-12 h-12 rounded-full border-4 border-[#3B945E] border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
};

export default Loading;