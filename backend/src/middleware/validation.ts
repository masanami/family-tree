import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler';

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  format?: 'email' | 'date' | 'uuid';
  enum?: string[];
  properties?: Record<string, ValidationRule>;
  items?: ValidationRule;
  minItems?: number;
  maxItems?: number;
}

export interface ValidationRules {
  body?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
};

const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const validateValue = (value: any, rule: ValidationRule, fieldName: string): string | null => {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${fieldName} is required`;
  }

  // If not required and no value, skip other validations
  if (!rule.required && (value === undefined || value === null)) {
    return null;
  }

  // Type validation
  if (rule.type) {
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${fieldName} must be a number`;
      }
      value = numValue; // Convert for further validations
    } else if (rule.type === 'boolean') {
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${fieldName} must be a boolean`;
      }
    } else if (rule.type === 'string' && typeof value !== 'string') {
      return `${fieldName} must be a string`;
    } else if (rule.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      return `${fieldName} must be an object`;
    } else if (rule.type === 'array' && !Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName} must be at least ${rule.minLength} characters long`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${fieldName} must be at most ${rule.maxLength} characters long`;
    }
    if (rule.format === 'email' && !validateEmail(value)) {
      return `${fieldName} must be a valid email address`;
    }
    if (rule.format === 'date' && !validateDate(value)) {
      return `${fieldName} must be a valid date (YYYY-MM-DD)`;
    }
    if (rule.format === 'uuid' && !validateUUID(value)) {
      return `${fieldName} must be a valid UUID`;
    }
  }

  // Number validations
  if (typeof value === 'number' || rule.type === 'number') {
    const numValue = Number(value);
    if (rule.min !== undefined && numValue < rule.min) {
      return `${fieldName} must be at least ${rule.min}`;
    }
    if (rule.max !== undefined && numValue > rule.max) {
      return `${fieldName} must be at most ${rule.max}`;
    }
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    return `${fieldName} must be one of: ${rule.enum.join(', ')}`;
  }

  // Array validations
  if (Array.isArray(value)) {
    if (rule.minItems && value.length < rule.minItems) {
      return `${fieldName} must contain at least ${rule.minItems} items`;
    }
    if (rule.maxItems && value.length > rule.maxItems) {
      return `${fieldName} must contain at most ${rule.maxItems} items`;
    }
    if (rule.items) {
      for (let i = 0; i < value.length; i++) {
        const itemError = validateValue(value[i], rule.items, `${fieldName}[${i}]`);
        if (itemError) {
          return itemError;
        }
      }
    }
  }

  // Object validations
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && rule.properties) {
    for (const [propName, propRule] of Object.entries(rule.properties)) {
      const propError = validateValue(value[propName], propRule, `${fieldName}.${propName}`);
      if (propError) {
        return propError;
      }
    }
  }

  return null;
};

export const validate = (rules: ValidationRules) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate body
    if (rules.body) {
      for (const [fieldName, rule] of Object.entries(rules.body)) {
        const error = validateValue(req.body[fieldName], rule, fieldName);
        if (error) {
          errors.push(error);
        }
      }
    }

    // Validate params
    if (rules.params) {
      for (const [fieldName, rule] of Object.entries(rules.params)) {
        const error = validateValue(req.params[fieldName], rule, fieldName);
        if (error) {
          errors.push(error);
        }
      }
    }

    // Validate query
    if (rules.query) {
      for (const [fieldName, rule] of Object.entries(rules.query)) {
        const error = validateValue(req.query[fieldName], rule, fieldName);
        if (error) {
          errors.push(error);
        }
      }
    }

    if (errors.length > 0) {
      next(new ApiError(400, errors.join(', ')));
    } else {
      next();
    }
  };
};