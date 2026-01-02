// Password validation utility
export const validatePassword = (password) => {
  const errors = [];
  
  // Check minimum length
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    errors: emailRegex.test(email) ? [] : ["Please enter a valid email address"]
  };
};

// Username validation
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  
  if (username && username.length > 30) {
    errors.push("Username must be less than 30 characters");
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name, fieldName = "Name") => {
  const errors = [];
  
  if (!name || name.trim().length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }
  
  if (name && name.length > 50) {
    errors.push(`${fieldName} must be less than 50 characters`);
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.push(`${fieldName} can only contain letters and spaces`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};