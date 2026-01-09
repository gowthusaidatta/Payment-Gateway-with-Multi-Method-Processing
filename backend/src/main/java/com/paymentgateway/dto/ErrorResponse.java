package com.paymentgateway.dto;

public class ErrorResponse {
    public Error error;
    
    public ErrorResponse(String code, String description) {
        this.error = new Error(code, description);
    }
    
    public static class Error {
        public String code;
        public String description;
        
        public Error(String code, String description) {
            this.code = code;
            this.description = description;
        }
    }
}
