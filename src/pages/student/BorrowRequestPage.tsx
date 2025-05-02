import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SearchFilter from "../../components/common/SearchFilter";
import InventoryItemCard from "../../components/common/InventoryItemCard";
import Loading from "../../components/common/Loading";
import { subscribeToData } from "../../firebase";
import { InventoryItem } from "../../utils/types";

const BorrowRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Subscribe to inventory items
  useEffect(() => {
    const unsubscribe = subscribeToData<Record<string, InventoryItem>>(
      "inventoryItems",
      (data) => {
        if (data) {
          const items = Object.values(data);
          setInventoryItems(items);
          setFilteredItems(items);
        } else {
          setInventoryItems([]);
          setFilteredItems([]);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = inventoryItems;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [searchTerm, categoryFilter, inventoryItems]);

  // Get unique categories for filter
  const categories = [
    ...new Set(inventoryItems.map((item) => item.category)),
  ].map((category) => ({
    label: category,
    value: category,
  }));

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle filter
  const handleFilter = (filter: string) => {
    setCategoryFilter(filter);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Borrow Equipment</h1>
        <p className="text-gray-600 mt-1">
          Browse and request laboratory equipment
        </p>
      </div>

      {/* Search and filter */}
      <div className="mb-8">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Search for equipment..."
          filterOptions={categories}
        />
      </div>

      {/* Inventory items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <InventoryItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
            <Info className="h-8 w-8 text-[#3B945E]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Items Found
          </h3>
          <p className="text-gray-600">
            No items match your search criteria. Try adjusting your filters or
            search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default BorrowRequestPage;
