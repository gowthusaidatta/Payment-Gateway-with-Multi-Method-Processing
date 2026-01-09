package com.paymentgateway.config;

import com.paymentgateway.entity.Merchant;
import com.paymentgateway.repository.MerchantRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Optional;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        // Explicitly allow merchant login to remain public
        if (path.equals("/api/v1/merchant/login") || path.startsWith("/api/v1/merchant/login/")) {
            return true;
        }
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            return true;
        }
        
        // Extract API credentials from headers
        String apiKey = request.getHeader("X-Api-Key");
        String apiSecret = request.getHeader("X-Api-Secret");
        
        // Validate credentials
        if (apiKey == null || apiSecret == null) {
            sendAuthenticationError(response, "Missing API credentials");
            return false;
        }
        
        Optional<Merchant> merchant = merchantRepository.findByApiKeyAndApiSecret(apiKey, apiSecret);
        if (merchant.isEmpty()) {
            sendAuthenticationError(response, "Invalid API credentials");
            return false;
        }
        
        // Store merchant in request attribute for later use
        request.setAttribute("merchant", merchant.get());
        return true;
    }
    
    private boolean isPublicEndpoint(String path) {
         return path.equals("/health") ||
             path.startsWith("/api/v1/test/") ||
             path.startsWith("/api/v1/orders") && path.contains("/public") ||
             path.startsWith("/api/v1/payments") && path.contains("/public") ||
             path.startsWith("/api/v1/merchant/login");
    }
    
    private void sendAuthenticationError(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        
        String errorResponse = objectMapper.writeValueAsString(
            new ErrorResponse(
                new ErrorDetails("AUTHENTICATION_ERROR", message)
            )
        );
        response.getWriter().write(errorResponse);
    }
    
    public static class ErrorResponse {
        public ErrorDetails error;
        
        public ErrorResponse(ErrorDetails error) {
            this.error = error;
        }
    }
    
    public static class ErrorDetails {
        public String code;
        public String description;
        
        public ErrorDetails(String code, String description) {
            this.code = code;
            this.description = description;
        }
    }
}
