package com.paymentgateway.config;

import com.paymentgateway.entity.Merchant;
import com.paymentgateway.repository.MerchantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.util.UUID;

@Component
public class DatabaseInitializer {
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    @PostConstruct
    public void initializeDatabase() {
        // Seed test merchant if not exists
        if (merchantRepository.findByEmail("test@example.com").isEmpty()) {
            Merchant testMerchant = new Merchant(
                "Test Merchant",
                "test@example.com",
                "key_test_abc123",
                "secret_test_xyz789"
            );
            testMerchant.setId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
            merchantRepository.save(testMerchant);
            System.out.println("✓ Test merchant seeded successfully");
        }
    }
}
