import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colorScheme: 'light' | 'dark';
  isLoaded: boolean;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => Promise<void>;
};

const STORAGE_KEY = 'ciruesbelt-theme-preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useNativeColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const storedPreference = await SecureStore.getItemAsync(STORAGE_KEY);

        if (
          isMounted &&
          (storedPreference === 'system' || storedPreference === 'light' || storedPreference === 'dark')
        ) {
          setPreferenceState(storedPreference);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setPreference = async (value: ThemePreference) => {
    setPreferenceState(value);
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  };

  const colorScheme = preference === 'system' ? systemColorScheme : preference;

  const value = useMemo(
    () => ({
      colorScheme,
      isLoaded,
      preference,
      setPreference,
    }),
    [colorScheme, isLoaded, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}