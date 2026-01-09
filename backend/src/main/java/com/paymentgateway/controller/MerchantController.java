package com.paymentgateway.controller;

import com.paymentgateway.dto.ErrorResponse;
import com.paymentgateway.entity.Merchant;
import com.paymentgateway.repository.MerchantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class MerchantController {
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    /**
     * POST /api/v1/merchant/login
     * Merchant login endpoint - returns API credentials
     */
    @PostMapping("/merchant/login")
    public ResponseEntity<?> merchantLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(400).body(
                new ErrorResponse("BAD_REQUEST_ERROR", "Email is required")
            );
        }
        
        Optional<Merchant> merchant = merchantRepository.findByEmail(email);
        if (merchant.isEmpty()) {
            return ResponseEntity.status(401).body(
                new ErrorResponse("AUTHENTICATION_ERROR", "Invalid email or password")
            );
        }
        
        // Return merchant credentials
        Map<String, Object> response = new HashMap<>();
        response.put("id", merchant.get().getId().toString());
        response.put("name", merchant.get().getName());
        response.put("email", merchant.get().getEmail());
        response.put("api_key", merchant.get().getApiKey());
        response.put("api_secret", merchant.get().getApiSecret());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/v1/merchant/stats
     * Get merchant statistics and dashboard data
     */
    @GetMapping("/merchant/stats")
    public ResponseEntity<?> getMerchantStats() {
        System.out.println("[DEBUG] getMerchantStats called");
        // This endpoint requires authentication (interceptor will validate)
        // Get merchant from request attribute set by AuthenticationInterceptor
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_transactions", 2843);
        stats.put("total_amount", 5000000.00);  // 50 lakhs
        stats.put("success_rate", 96.8);
        stats.put("today_transactions", 47);
        stats.put("today_amount", 187500.00);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * GET /api/v1/merchant/transactions
     * Get merchant transactions list
     */
    @GetMapping("/merchant/transactions")
    public ResponseEntity<?> getMerchantTransactions() {
        // Returning 50 sample transactions
        Map<String, Object> response = new HashMap<>();
        java.util.List<Map<String, Object>> transactions = new java.util.ArrayList<>();
        
        int[] amounts = {2500, 5000, 1200, 8500, 15000, 3200, 6700, 12000, 4500, 9800,
                        18500, 2200, 7500, 4800, 11000, 6300, 3900, 14500, 8200, 5500,
                        9200, 16000, 3500, 7200, 5800, 12500, 4200, 8900, 6500, 10500,
                        13500, 4700, 9500, 7800, 15500, 5200, 11500, 8700, 6800, 14000,
                        9900, 5900, 12800, 7200, 16500, 4900, 10200, 8400, 6200, 13200};
        
        for (int i = 0; i < 50; i++) {
            Map<String, Object> tx = new HashMap<>();
            tx.put("id", "pay_" + String.format("%08d", 100 + i));
            tx.put("order_id", "ORD-" + String.format("%06d", 20000 + i));
            tx.put("amount", amounts[i]);
            tx.put("method", i % 2 == 0 ? "CARD" : "UPI");
            tx.put("status", i % 10 == 8 ? "processing" : (i % 10 == 9 ? "failed" : "success"));
            tx.put("created_at", System.currentTimeMillis() - (i * 3600000L));
            transactions.add(tx);
        }
        
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * GET /api/v1/test/merchant
     * Returns test merchant details
     */
    @GetMapping("/test/merchant")
    public ResponseEntity<?> getTestMerchant() {
        Optional<Merchant> merchant = merchantRepository.findByEmail("test@example.com");
        if (merchant.isEmpty()) {
            return ResponseEntity.status(404).body(
                new ErrorResponse("NOT_FOUND_ERROR", "Test merchant not found")
            );
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", merchant.get().getId().toString());
        response.put("name", merchant.get().getName());
        response.put("email", merchant.get().getEmail());
        response.put("api_key", merchant.get().getApiKey());
        response.put("api_secret", merchant.get().getApiSecret());
        
        return ResponseEntity.ok(response);
    }
}
