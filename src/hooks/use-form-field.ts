import { useState, useCallback } from 'react';

interface UseFormFieldOptions<T> {
  validate?: (value: T) => string | null;
  initialError?: string | null;
}

/**
 * Custom hook for managing individual form field state with validation
 *
 * @example
 * const email = useFormField('', {
 *   validate: (value) => {
 *     if (!value) return 'Email is required';
 *     if (!value.includes('@')) return 'Invalid email';
 *     return null;
 *   }
 * });
 *
 * // In your component:
 * <Input
 *   value={email.value}
 *   onChange={email.handleChange}
 *   onBlur={email.handleBlur}
 * />
 * {email.error && <span className="text-red-500">{email.error}</span>}
 */
export function useFormField<T>(
  initialValue: T,
  options: UseFormFieldOptions<T> = {}
) {
  const { validate, initialError = null } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(initialError);
  const [touched, setTouched] = useState(false);

  const validateValue = useCallback((val: T): string | null => {
    if (validate) {
      return validate(val);
    }
    return null;
  }, [validate]);

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    // Clear error on change if field was previously touched
    if (touched && error) {
      const validationError = validateValue(newValue);
      setError(validationError);
    }
  }, [touched, error, validateValue]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const validationError = validateValue(value);
    setError(validationError);
  }, [value, validateValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(initialError);
    setTouched(false);
  }, [initialValue, initialError]);

  const setFieldError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const isValid = error === null;

  return {
    value,
    setValue,
    handleChange,
    handleBlur,
    error,
    setError: setFieldError,
    touched,
    setTouched,
    isValid,
    reset,
  };
}

/**
 * Helper hook for managing multiple form fields
 *
 * @example
 * const form = useFormFields({
 *   email: ['', { validate: (v) => !v ? 'Required' : null }],
 *   password: ['', { validate: (v) => v.length < 6 ? 'Too short' : null }],
 * });
 *
 * const isFormValid = form.isValid;
 * form.reset();
 */
export function useFormFields<T extends Record<string, any>>(
  fields: {
    [K in keyof T]: [T[K], UseFormFieldOptions<T[K]>?];
  }
) {
  const formFields = Object.entries(fields).reduce((acc, [key, [initialValue, options]]) => {
    acc[key as keyof T] = useFormField(initialValue, options);
    return acc;
  }, {} as { [K in keyof T]: ReturnType<typeof useFormField<T[K]>> });

  const isValid = Object.values(formFields).every(
    (field: any) => field.isValid
  );

  const reset = useCallback(() => {
    Object.values(formFields).forEach((field: any) => field.reset());
  }, [formFields]);

  const getValues = useCallback((): T => {
    return Object.entries(formFields).reduce((acc, [key, field]) => {
      acc[key as keyof T] = (field as any).value;
      return acc;
    }, {} as T);
  }, [formFields]);

  return {
    fields: formFields,
    isValid,
    reset,
    getValues,
  };
}
