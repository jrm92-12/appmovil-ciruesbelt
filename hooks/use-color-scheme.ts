import { useAppTheme } from '@/src/providers/theme-provider';

export function useColorScheme() {
  return useAppTheme().colorScheme;
}