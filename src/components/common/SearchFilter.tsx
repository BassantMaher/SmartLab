import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilter?: (filter: string) => void;
  placeholder?: string;
  filterOptions?: Option[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  onFilter, 
  placeholder = 'Search...', 
  filterOptions = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilter) onFilter(filter);
    setIsFilterOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {filterOptions.length > 0 && (
          <div className="ml-2 relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-lg border ${
                selectedFilter 
                  ? 'border-[#3B945E] bg-[#DFF5E1] text-[#3B945E]' 
                  : 'border-gray-300 bg-white text-gray-500'
              } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B945E]`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedFilter === option.value
                        ? 'bg-[#DFF5E1] text-[#3B945E]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleFilterSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                {selectedFilter && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    onClick={() => handleFilterSelect('')}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;