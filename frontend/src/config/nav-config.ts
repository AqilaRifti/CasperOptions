import { NavItem } from '@/types';

/**
 * Navigation configuration for LST Options Demo
 * Simplified for hackathon - wallet auth only, no Clerk
 */
export const navItems: NavItem[] = [
  {
    title: 'Marketplace',
    url: '/dashboard/options',
    icon: 'product',
    isActive: true,
    shortcut: ['m', 'm'],
    items: []
  },
  {
    title: 'My Options',
    url: '/dashboard/options/my',
    icon: 'profile',
    isActive: false,
    shortcut: ['o', 'o'],
    items: []
  },
  {
    title: 'History',
    url: '/dashboard/options/history',
    icon: 'billing',
    isActive: false,
    shortcut: ['h', 'h'],
    items: []
  },
];
