import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  trigger?: ReactElement;
  className?: string;
}

export function Modal({
  isOpen,
  onOpenChange,
  title,
  children,
  trigger,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="bg-black/15 backdrop-blur-xs"
        className={cn(
          'top-2 left-2 right-2 mx-auto w-auto max-w-md max-h-[calc(100dvh-1rem)] translate-x-0 translate-y-0 gap-2 overflow-y-auto rounded-xl border-0 bg-background px-4 py-3 dark:bg-secondary sm:max-w-md data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4',
          className,
        )}
      >
        <DialogTitle className="pr-6 text-xl font-semibold leading-normal">
          {title}
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
