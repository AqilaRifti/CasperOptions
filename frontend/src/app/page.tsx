import { redirect } from 'next/navigation';

/**
 * Home page - redirects to options marketplace
 */
export default function HomePage() {
  redirect('/dashboard/options');
}
