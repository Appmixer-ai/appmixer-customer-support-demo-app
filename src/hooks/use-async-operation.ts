import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling async operations with loading, error states, and toast notifications
 *
 * @example
 * const { isLoading, error, execute } = useAsyncOperation({
 *   successMessage: "Ticket created successfully",
 *   errorMessage: "Failed to create ticket"
 * });
 *
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     await createTicket(data);
 *   });
 * };
 */
export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        setState({ isLoading: true, error: null });
        const result = await operation();

        setState({ isLoading: false, error: null });

        if (showSuccessToast && successMessage) {
          toast({
            title: successMessage,
          });
        }

        onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        const message = errorMessage || error.message;

        setState({ isLoading: false, error: message });

        if (showErrorToast) {
          toast({
            variant: 'destructive',
            title: message,
          });
        }

        onError?.(error);
        throw error;
      }
    },
    [successMessage, errorMessage, onSuccess, onError, showSuccessToast, showErrorToast, toast]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    execute,
    reset,
  };
}
