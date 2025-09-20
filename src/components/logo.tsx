import { ShieldHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-headline text-lg font-bold text-primary [filter:drop-shadow(0_0_8px_hsl(var(--primary)/0.8))]", className)}>
      <ShieldHalf className="h-6 w-6" />
      <span>GuardianHealth Pulse</span>
    </div>
  );
}
