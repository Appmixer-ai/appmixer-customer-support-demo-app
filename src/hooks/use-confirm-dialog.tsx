import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Custom hook for confirmation dialogs
 * Provides a reusable confirmation dialog with promise-based API
 *
 * @example
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Delete ticket?",
 *     description: "This action cannot be undone.",
 *     variant: "destructive"
 *   });
 *
 *   if (confirmed) {
 *     await deleteTicket(id);
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <ConfirmDialog />
 *   </>
 * );
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    variant: 'default',
  });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions({
          confirmLabel: 'Continue',
          cancelLabel: 'Cancel',
          variant: 'default',
          ...opts,
        });
        setIsOpen(true);
        setResolver(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolver) {
      resolver(true);
      setResolver(null);
    }
    setIsOpen(false);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
    setIsOpen(false);
  }, [resolver]);

  const ConfirmDialog = useCallback(
    () => (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {options.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [isOpen, options, handleConfirm, handleCancel]
  );

  return {
    confirm,
    ConfirmDialog,
    isOpen,
  };
}
