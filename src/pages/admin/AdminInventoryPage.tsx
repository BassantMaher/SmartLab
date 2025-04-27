import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpDown, Search } from 'lucide-react';
import SearchFilter from '../../components/common/SearchFilter';
import InventoryItemCard from '../../components/common/InventoryItemCard';
import Loading from '../../components/common/Loading';
import { getInventoryItems } from '../../utils/localStorage';
import { InventoryItem } from '../../utils/types';

const AdminInventoryPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Load inventory items
  useEffect(() => {
    const items = getInventoryItems();
    setInventoryItems(items);
    setFilteredItems(items);
    setIsLoading(false);
  }, []);
  
  // Handle search, filter, and sort
  useEffect(() => {
    let filtered = [...inventoryItems];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let valueA: any = a[sortBy as keyof InventoryItem];
      let valueB: any = b[sortBy as keyof InventoryItem];
      
      // Handle numeric values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Handle string values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [searchTerm, categoryFilter, inventoryItems, sortBy, sortDirection]);
  
  // Get unique categories for filter
  const categories = [...new Set(inventoryItems.map(item => item.category))].map(category => ({
    label: category,
    value: category
  }));
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Handle filter
  const handleFilter = (filter: string) => {
    setCategoryFilter(filter);
  };
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage and track laboratory equipment</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="px-4 py-2 bg-[#3B945E] text-white rounded-lg shadow-sm hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E] transition-colors duration-150"
          >
            <div className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add Item
            </div>
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="w-full md:w-2/3">
          <SearchFilter 
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Search inventory..."
            filterOptions={categories}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg border ${
              view === 'grid' 
                ? 'border-[#3B945E] bg-[#DFF5E1] text-[#3B945E]' 
                : 'border-gray-300 bg-white text-gray-500'
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B945E]`}
          >
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded-lg border ${
              view === 'table' 
                ? 'border-[#3B945E] bg-[#DFF5E1] text-[#3B945E]' 
                : 'border-gray-300 bg-white text-gray-500'
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B945E]`}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
              <div className="w-4 h-1 bg-current rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Inventory items */}
      {filteredItems.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <InventoryItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th 
                      className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Item Name
                        {sortBy === 'name' && (
                          <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {sortBy === 'category' && (
                          <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('availableQuantity')}
                    >
                      <div className="flex items-center">
                        Available
                        {sortBy === 'availableQuantity' && (
                          <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        {sortBy === 'location' && (
                          <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const availabilityPercentage = (item.availableQuantity / item.totalQuantity) * 100;
                    let statusColor = 'bg-green-100 text-green-800';
                    if (availabilityPercentage <= 20) {
                      statusColor = 'bg-red-100 text-red-800';
                    } else if (availabilityPercentage <= 50) {
                      statusColor = 'bg-yellow-100 text-yellow-800';
                    }
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-[#DFF5E1] flex items-center justify-center">
                                  <span className="text-[#3B945E] font-medium text-xs">No Img</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#DFF5E1] text-[#3B945E]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.availableQuantity} / {item.totalQuantity}</div>
                          <div className="w-16 mt-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                availabilityPercentage > 60 ? 'bg-green-500' : 
                                availabilityPercentage > 30 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${availabilityPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#3B945E] hover:text-[#74B49B] mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
            <Search className="h-8 w-8 text-[#3B945E]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Items Found</h3>
          <p className="text-gray-600">
            No items match your search criteria. Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;