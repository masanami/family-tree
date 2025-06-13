export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegistration(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!data.password) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  } else {
    if (data.password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long'
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter'
      });
    }
    if (!/[0-9]/.test(data.password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number'
      });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character'
      });
    }
  }

  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  }

  return errors;
}

export function validateLogin(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!data.password || data.password === '') {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}