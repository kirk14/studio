import { redirect } from 'next/navigation';

export default function Home() {
  // In a real app, you'd check for an active session.
  // For this example, we'll redirect to the auth page to start.
  redirect('/auth');
}
