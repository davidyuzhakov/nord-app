import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface AuthFieldProps extends ComponentProps<typeof Input> {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  children?: ReactNode;
}

export function AuthField({
  id,
  label,
  icon: Icon,
  description,
  children,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="relative rounded-md bg-muted dark:bg-input/30">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          aria-describedby={description ? `${id}-description` : undefined}
          className={cn(
            'auth-input pl-11 pr-4 py-6 bg-transparent dark:bg-transparent text-sm',
            className,
          )}
          {...props}
        />
        {children}
      </div>
      {description && (
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
