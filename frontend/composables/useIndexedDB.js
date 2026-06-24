import { get, set, del, clear } from "idb-keyval";

export const useIndexedDB = () => {
  // Save data to IndexedDB
  const setItem = async (key, value) => {
    if (!process.client) return;
    try {
      await set(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to IndexedDB:`, error);
    }
  };

  // Retrieve data from IndexedDB
  const getItem = async (key) => {
    if (!process.client) return null;
    try {
      return await get(key);
    } catch (error) {
      console.error(`Error reading ${key} from IndexedDB:`, error);
      return null;
    }
  };

  // Delete a specific key
  const removeItem = async (key) => {
    if (!process.client) return;
    try {
      await del(key);
    } catch (error) {
      console.error(`Error removing ${key} from IndexedDB:`, error);
    }
  };

  // Nuke the entire store (useful for aggressive logouts)
  const clearStore = async () => {
    if (!process.client) return;
    try {
      await clear();
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
    }
  };

  return {
    setItem,
    getItem,
    removeItem,
    clearStore,
  };
};
