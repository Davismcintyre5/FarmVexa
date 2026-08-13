export const validateLogin = (data: { email: string; password: string }) => {
    const errors: any = {};
    if (!data.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email';
    if (!data.password) errors.password = 'Password is required';
    else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
};

export const validateRegister = (data: any) => {
    const errors: any = {};
    if (!data.name) errors.name = 'Name is required';
    if (!data.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email';
    if (!data.password) errors.password = 'Password is required';
    else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (data.confirmPassword && data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
};