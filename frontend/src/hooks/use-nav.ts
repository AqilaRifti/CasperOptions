'use client';

/**
 * Simple hook for navigation items
 * No RBAC needed - wallet-only auth
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to get navigation items (no filtering needed for wallet-only auth)
 */
export function useFilteredNavItems(items: NavItem[]) {
  return useMemo(() => items, [items]);
}
