import { useState, useEffect } from 'react';
import { useModal } from './useModal'; // Import the useModal hook

export interface InventoryItem {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = 'ingreedy-inventory';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pantryInput, setPantryInput] = useState('');
  
  // Get showModal from useModal
  const { showModal } = useModal();

  // Load from localStorage on mount
  useEffect(() => {
    const loadInventory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as InventoryItem[];
            setInventory(parsed);
          // Only update if different from current state
           setInventory(prev => {
          // Compare stringified versions to avoid reference comparison issues
          const shouldUpdate = JSON.stringify(prev) !== stored;
          
          // Explicitly return either the parsed data or previous state
          return shouldUpdate ? parsed : prev;
        });
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
        // Show modal only if not already showing
        showModal('Failed to load inventory data', 'alert');
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []); 

  const addItem = async (name: string) => {
    const item = name.trim();
    if (!item) {
      showModal('Please enter a pantry item.', 'alert');
      return;
    }

    try {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: item,
        createdAt: new Date().toISOString()
      };
      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInventory));
      showModal(`${item} added to inventory.`, 'alert');
      return newItem;
    } catch (e) {
      showModal("Failed to add item to inventory.", 'alert');
      console.error("Error adding item:", e);
      throw e;
    }
  };

    const removeItem = async (itemId: string) => {
    showModal(
      `Are you sure you want to remove this item from your inventory?`,
      'confirm',
      () => {
        try {
          const updatedInventory = inventory.filter(item => item.id !== itemId);
          setInventory(updatedInventory);
          localStorage.setItem('ingreedyInventory', JSON.stringify(updatedInventory));
          showModal('Item removed from inventory.', 'alert');
        } catch (e) {
          console.error("Error deleting item:", e);
          showModal("Failed to delete item from inventory.", 'alert');
        }
      }
    );
  };

  return {
    inventory,
    isLoading,
    pantryInput,
    setPantryInput,
    addItem,
    removeItem
  };
};