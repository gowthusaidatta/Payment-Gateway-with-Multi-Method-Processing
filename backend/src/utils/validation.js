// VPA Validation
const validateVPA = (vpa) => {
  if (!vpa) return false;
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

// Luhn Algorithm for Card Validation
const validateCardNumber = (cardNumber) => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if only digits and length between 13 and 19
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Apply Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Card Network Detection
const detectCardNetwork = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Visa
  if (cleaned.startsWith('4')) {
    return 'visa';
  }
  
  // Mastercard (51-55)
  const firstTwo = cleaned.substring(0, 2);
  if (['51', '52', '53', '54', '55'].includes(firstTwo)) {
    return 'mastercard';
  }
  
  // Amex (34 or 37)
  if (['34', '37'].includes(firstTwo)) {
    return 'amex';
  }
  
  // RuPay (60, 65, 81-89)
  if (firstTwo === '60' || firstTwo === '65') {
    return 'rupay';
  }
  const firstTwoNum = parseInt(firstTwo);
  if (firstTwoNum >= 81 && firstTwoNum <= 89) {
    return 'rupay';
  }
  
  return 'unknown';
};

// Expiry Validation
const validateExpiry = (month, year) => {
  const monthNum = parseInt(month);
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  // Parse year - accept both 2-digit and 4-digit formats
  let yearNum = parseInt(year);
  if (year.length === 2) {
    yearNum = 2000 + yearNum;
  }
  
  // Compare with current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  if (yearNum < currentYear) {
    return false;
  }
  
  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }
  
  return true;
};

// Generate random alphanumeric string
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate Order ID
const generateOrderId = () => {
  return 'order_' + generateRandomString(16);
};

// Generate Payment ID
const generatePaymentId = () => {
  return 'pay_' + generateRandomString(16);
};

module.exports = {
  validateVPA,
  validateCardNumber,
  detectCardNetwork,
  validateExpiry,
  generateOrderId,
  generatePaymentId,
};
