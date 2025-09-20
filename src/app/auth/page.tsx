import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/logo';

export default function AuthenticationPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
      <Logo className="text-2xl" />
      <AuthForm />
    </main>
  );
}
