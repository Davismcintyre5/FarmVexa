export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone: string) => /^(\+254|0)[17]\d{8}$/.test(phone);
export const isRequired = (value: any) => value !== null && value !== undefined && value.toString().trim() !== '';
export const minLength = (value: string, min: number) => value && value.length >= min;
export const maxLength = (value: string, max: number) => value && value.length <= max;

export const validateLogin = (data: { email: string; password: string }) => {
  const errors: Record<string, string> = {};
  if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
  if (!isRequired(data.password)) errors.password = 'Password is required';
  return errors;
};

export const validateRegistration = (data: any) => {
  const errors: Record<string, string> = {};
  if (!isRequired(data.name) || !minLength(data.name, 2)) errors.name = 'Name must be at least 2 characters';
  if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
  if (!isValidPhone(data.phone)) errors.phone = 'Valid Kenyan phone number is required';
  if (!isRequired(data.password) || !minLength(data.password, 6)) errors.password = 'Password must be at least 6 characters';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateFarm = (data: any) => {
  const errors: Record<string, string> = {};
  if (!isRequired(data.name)) errors.name = 'Farm name is required';
  return errors;
};

export const validateField = (data: any) => {
  const errors: Record<string, string> = {};
  if (!isRequired(data.name)) errors.name = 'Field name is required';
  return errors;
};

export const validatePasswordChange = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
  const errors: Record<string, string> = {};
  if (!isRequired(data.currentPassword)) errors.currentPassword = 'Current password is required';
  if (!isRequired(data.newPassword) || !minLength(data.newPassword, 6)) errors.newPassword = 'Password must be at least 6 characters';
  if (data.newPassword !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};