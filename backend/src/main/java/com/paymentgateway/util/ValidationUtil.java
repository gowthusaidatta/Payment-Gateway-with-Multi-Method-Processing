package com.paymentgateway.util;

public class ValidationUtil {
    
    /**
     * Validate VPA (UPI ID) format
     */
    public static boolean validateVPA(String vpa) {
        if (vpa == null || vpa.isEmpty()) {
            return false;
        }
        return vpa.matches("^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$");
    }
    
    /**
     * Validate card number using Luhn algorithm
     */
    public static boolean validateCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return false;
        }
        
        String cleaned = cardNumber.replaceAll("[\\s-]", "");
        
        // Check if only digits and length between 13 and 19
        if (!cleaned.matches("^\\d{13,19}$")) {
            return false;
        }
        
        // Apply Luhn algorithm
        int sum = 0;
        boolean isEven = false;
        
        for (int i = cleaned.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cleaned.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 == 0;
    }
    
    /**
     * Detect card network from card number
     */
    public static String detectCardNetwork(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "unknown";
        }
        
        String cleaned = cardNumber.replaceAll("[\\s-]", "");
        
        // Visa
        if (cleaned.startsWith("4")) {
            return "visa";
        }
        
        // Mastercard (51-55)
        String firstTwo = cleaned.substring(0, Math.min(2, cleaned.length()));
        if (firstTwo.length() >= 2) {
            if (firstTwo.matches("^(51|52|53|54|55)$")) {
                return "mastercard";
            }
        }
        
        // Amex (34 or 37)
        if (firstTwo.matches("^(34|37)$")) {
            return "amex";
        }
        
        // RuPay (60, 65, 81-89)
        if (firstTwo.matches("^(60|65)$")) {
            return "rupay";
        }
        
        if (firstTwo.length() >= 2) {
            try {
                int firstTwoNum = Integer.parseInt(firstTwo);
                if (firstTwoNum >= 81 && firstTwoNum <= 89) {
                    return "rupay";
                }
            } catch (NumberFormatException e) {
                // Ignore
            }
        }
        
        return "unknown";
    }
    
    /**
     * Validate card expiry date
     */
    public static boolean validateExpiry(String month, String year) {
        try {
            int monthNum = Integer.parseInt(month);
            if (monthNum < 1 || monthNum > 12) {
                return false;
            }
            
            // Parse year - accept both 2-digit and 4-digit formats
            int yearNum = Integer.parseInt(year);
            if (year.length() == 2) {
                yearNum = 2000 + yearNum;
            }
            
            // Compare with current date
            java.time.YearMonth now = java.time.YearMonth.now();
            java.time.YearMonth cardExpiry = java.time.YearMonth.of(yearNum, monthNum);
            
            return !cardExpiry.isBefore(now);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Generate random alphanumeric string
     */
    public static String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < length; i++) {
            result.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return result.toString();
    }
    
    /**
     * Generate Order ID
     */
    public static String generateOrderId() {
        return "order_" + generateRandomString(16);
    }
    
    /**
     * Generate Payment ID
     */
    public static String generatePaymentId() {
        return "pay_" + generateRandomString(16);
    }
}
