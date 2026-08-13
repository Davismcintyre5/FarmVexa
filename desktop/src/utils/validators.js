export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) => /^(\+254|0)[17]\d{8}$/.test(phone);
export const isRequired = (value) => value !== null && value !== undefined && value.toString().trim() !== '';
export const minLength = (value, min) => value && value.length >= min;
export const maxLength = (value, max) => value && value.length <= max;

export const validateRegistration = (data) => {
    const errors = {};
    if (!isRequired(data.name) || !minLength(data.name, 2)) errors.name = 'Name must be at least 2 characters';
    if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
    if (!isValidPhone(data.phone)) errors.phone = 'Valid Kenyan phone number is required';
    if (!isRequired(data.password) || !minLength(data.password, 6)) errors.password = 'Password must be at least 6 characters';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!data.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    return errors;
};

export const validateLogin = (data) => {
    const errors = {};
    if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
    if (!isRequired(data.password)) errors.password = 'Password is required';
    return errors;
};

export const validateFarm = (data) => {
    const errors = {};
    if (!isRequired(data.name)) errors.name = 'Farm name is required';
    return errors;
};

export const validateField = (data) => {
    const errors = {};
    if (!isRequired(data.name)) errors.name = 'Field name is required';
    return errors;
};