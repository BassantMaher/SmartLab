import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpDown, Search, X } from 'lucide-react';
import SearchFilter from '../../components/common/SearchFilter';
import InventoryItemCard from '../../components/common/InventoryItemCard';
import Loading from '../../components/common/Loading';
import { subscribeToData, createData, deleteData, generateId } from '../../firebase';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load inventory items from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToData<Record<string, InventoryItem>>(
      'inventoryItems',
      (data) => {
        if (data) {
          const items = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setInventoryItems(items);
          setFilteredItems(items);
        } else {
          setInventoryItems([]);
          setFilteredItems([]);
        }
        setIsLoading(false);
      },
      (err: Error) => {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle search, filter, and sort
  useEffect(() => {
    let filtered = [...inventoryItems];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    filtered = filtered.sort((a: InventoryItem, b: InventoryItem) => {
      const valueA = a[sortBy as keyof InventoryItem];
      const valueB = b[sortBy as keyof InventoryItem];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });

    setFilteredItems(filtered);
  }, [searchTerm, categoryFilter, inventoryItems, sortBy, sortDirection]);

  const categories = [...new Set(inventoryItems.map((item) => item.category))].map((category) => ({
    label: category,
    value: category,
  }));

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilter = (filter: string) => {
    setCategoryFilter(filter);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      // Delete item from Realtime Database
      await deleteData(`inventoryItems/${itemToDelete.id}`);
      console.log(`Item ${itemToDelete.id} deleted from database`);

      // Update local state
      setInventoryItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setFilteredItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      console.log(`Item ${itemToDelete.id} removed from UI`);
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(`Failed to delete item: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
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
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#3B945E] text-white rounded-lg shadow-sm hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E] transition-colors duration-150"
          >
            <div className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add Item
            </div>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

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

      {filteredItems.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onManage={handleEditItem}
                onDelete={handleDeleteItem}
              />
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
                                availabilityPercentage > 60
                                  ? 'bg-green-500'
                                  : availabilityPercentage > 30
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${availabilityPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-[#3B945E] hover:text-[#74B49B] mr-3"
                            disabled={isDeleting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isDeleting}
                          >
                            {isDeleting && itemToDelete?.id === item.id ? 'Deleting...' : 'Delete'}
                          </button>
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

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <AddItemModal
          item={selectedItem}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          item={itemToDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsConfirmDeleteOpen(false);
            setItemToDelete(null);
          }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

// Modal Component for Adding/Editing Inventory Items
const AddItemModal: React.FC<{ item?: InventoryItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const isEditMode = !!item;
  const [formData, setFormData] = useState<InventoryItem>({
    id: item?.id || '',
    name: item?.name || '',
    category: item?.category || '',
    description: item?.description || '',
    totalQuantity: item?.totalQuantity || 0,
    availableQuantity: item?.availableQuantity || 0,
    physicalQuantity: item?.physicalQuantity || 0,
    image: item?.image || '',
    specifications: item?.specifications || {},
  });
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalQuantity' || name === 'availableQuantity' || name === 'physicalQuantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddSpecification = () => {
    if (specKey && specValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue,
        },
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.category || !formData.description) {
      setError('Please fill in all required fields (Name, Category, Description).');
      setIsSubmitting(false);
      return;
    }
    if (formData.totalQuantity <= 0) {
      setError('Total Quantity must be greater than 0.');
      setIsSubmitting(false);
      return;
    }
    if (formData.availableQuantity < 0 || formData.availableQuantity > formData.totalQuantity) {
      setError('Available Quantity must be between 0 and Total Quantity.');
      setIsSubmitting(false);
      return;
    }
    if (formData.physicalQuantity <= 0) {
      setError('Physical Quantity must be greater than 0.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        // Update existing item
        const updatedItem: InventoryItem = {
          ...formData,
          id: item!.id,
          availableQuantity: formData.availableQuantity || formData.totalQuantity,
        };
        await createData(`inventoryItems/${item!.id}`, updatedItem);
        console.log(`Item ${item!.id} updated in database`);
      } else {
        // Add new item
        const newId = generateId('inventoryItems');
        const newItem: InventoryItem = {
          ...formData,
          id: newId,
          availableQuantity: formData.availableQuantity || formData.totalQuantity,
        };
        await createData(`inventoryItems/${newId}`, newItem);
        console.log(`New item ${newId} added to database`);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving item:', err);
      setError(`Failed to save item: ${err.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Total Quantity */}
          <div>
            <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700">
              Total Quantity *
            </label>
            <input
              type="number"
              id="totalQuantity"
              name="totalQuantity"
              value={formData.totalQuantity}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Available Quantity */}
          <div>
            <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
              Available Quantity *
            </label>
            <input
              type="number"
              id="availableQuantity"
              name="availableQuantity"
              value={formData.availableQuantity}
              onChange={handleInputChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Physical Quantity */}
          <div>
            <label htmlFor="physicalQuantity" className="block text-sm font-medium text-gray-700">
              Physical Quantity *
            </label>
            <input
              type="number"
              id="physicalQuantity"
              name="physicalQuantity"
              value={formData.physicalQuantity}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Specifications (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Specifications</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                placeholder="Key (e.g., Brand)"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
                disabled={isSubmitting}
              />
              <input
                type="text"
                placeholder="Value (e.g., Nikon)"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="px-3 py-1 bg-[#3B945E] text-white rounded-lg hover:bg-[#74B49B] focus:outline-none"
                disabled={isSubmitting}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                  <span className="text-sm text-gray-700">
                    {key}: {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(key)}
                    className="text-red-600 hover:text-red-800"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3B945E] text-white rounded-lg hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Component for Confirming Deletion
const ConfirmDeleteModal: React.FC<{
  item: InventoryItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ item, onConfirm, onCancel, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium">{item?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;