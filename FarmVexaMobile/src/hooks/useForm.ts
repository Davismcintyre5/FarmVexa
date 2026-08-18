import { useState, useCallback } from 'react';

interface FormState {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

export function useForm<T extends FormState>(
  initialState: T,
  validators?: { [K in keyof T]?: (value: any, form: T) => string | undefined }
) {
  const [form, setForm] = useState<T>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name as string]: '' }));
  }, []);

  const validate = useCallback((): boolean => {
    if (!validators) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validators).forEach((key) => {
      const validator = validators[key as keyof T];
      if (validator) {
        const error = validator(form[key as keyof T], form);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [form, validators]);

  const resetForm = useCallback(() => {
    setForm(initialState);
    setErrors({});
  }, [initialState]);

  return {
    form,
    errors,
    handleChange,
    validate,
    resetForm,
    setForm,
  };
}