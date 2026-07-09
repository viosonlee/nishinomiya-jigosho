import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'nishinomiya_favorites';

/**
 * Load favorites from localStorage.
 * Stores an array of service names (事業所名) as unique identifiers.
 */
function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favSet]));
  } catch {
    // localStorage might be full
  }
}

/**
 * Custom hook for managing favorited services.
 * Uses 事業所名 (service name) as the unique key.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => loadFavorites());

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((serviceName) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(serviceName)) {
        next.delete(serviceName);
      } else {
        next.add(serviceName);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((serviceName) => {
    return favorites.has(serviceName);
  }, [favorites]);

  const favoritesCount = favorites.size;

  return { favorites, toggleFavorite, isFavorite, favoritesCount };
}
