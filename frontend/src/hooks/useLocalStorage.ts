import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// User preferences hook
export interface UserPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredSectors: string[];
  defaultTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
  notifications: {
    priceAlerts: boolean;
    reportUpdates: boolean;
    marketNews: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  currency: 'AUD' | 'USD' | 'EUR';
}

const defaultPreferences: UserPreferences = {
  riskTolerance: 'moderate',
  preferredSectors: [],
  defaultTimeframe: '1M',
  notifications: {
    priceAlerts: true,
    reportUpdates: true,
    marketNews: false,
  },
  theme: 'dark',
  currency: 'AUD',
};

export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage<UserPreferences>(
    'mugPunters_user_preferences',
    defaultPreferences
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}

// Report history hook
export interface ReportHistoryItem {
  id: string;
  symbol: string;
  title: string;
  createdAt: string;
  lastViewed: string;
  isFavorite: boolean;
}

export function useReportHistory() {
  const [history, setHistory, removeHistory] = useLocalStorage<ReportHistoryItem[]>(
    'mugPunters_report_history',
    []
  );

  const addToHistory = useCallback((report: Omit<ReportHistoryItem, 'lastViewed' | 'isFavorite'>) => {
    setHistory(prev => {
      const existing = prev.find(item => item.id === report.id);
      if (existing) {
        // Update last viewed time
        return prev.map(item => 
          item.id === report.id 
            ? { ...item, lastViewed: new Date().toISOString() }
            : item
        );
      } else {
        // Add new item
        return [
          {
            ...report,
            lastViewed: new Date().toISOString(),
            isFavorite: false,
          },
          ...prev
        ].slice(0, 50); // Keep only last 50 items
      }
    });
  }, [setHistory]);

  const toggleFavorite = useCallback((id: string) => {
    setHistory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );
  }, [setHistory]);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    removeHistory();
  }, [removeHistory]);

  const getFavorites = useCallback(() => {
    return history.filter(item => item.isFavorite);
  }, [history]);

  const getRecentReports = useCallback((limit: number = 10) => {
    return history
      .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
      .slice(0, limit);
  }, [history]);

  return {
    history,
    addToHistory,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
    getFavorites,
    getRecentReports,
  };
}
