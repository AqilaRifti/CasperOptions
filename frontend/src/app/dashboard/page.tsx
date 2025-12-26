import { redirect } from 'next/navigation';

/**
 * Dashboard root - redirects to options marketplace
 */
export default function DashboardPage() {
  redirect('/dashboard/options');
}
