package com.paymentgateway.controller;

import com.paymentgateway.model.Merchant;
import com.paymentgateway.repository.MerchantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class MerchantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MerchantRepository merchantRepository;

    private Merchant testMerchant;

    @BeforeEach
    public void setup() {
        testMerchant = new Merchant();
        testMerchant.setId(1L);
        testMerchant.setName("Test Merchant");
        testMerchant.setEmail("test@example.com");
        testMerchant.setApiKey("test_key");
        testMerchant.setApiSecret("test_secret");
    }

    @Test
    public void testMerchantLogin() throws Exception {
        when(merchantRepository.findByApiKey(anyString())).thenReturn(Optional.of(testMerchant));

        mockMvc.perform(post("/api/v1/merchant/login")
                .header("X-Api-Key", "test_key")
                .header("X-Api-Secret", "test_secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    public void testGetMerchantStats() throws Exception {
        when(merchantRepository.findByApiKey(anyString())).thenReturn(Optional.of(testMerchant));

        mockMvc.perform(get("/api/v1/merchant/stats")
                .header("X-Api-Key", "test_key")
                .header("X-Api-Secret", "test_secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_amount").exists())
                .andExpect(jsonPath("$.total_transactions").exists())
                .andExpect(jsonPath("$.success_rate").exists());
    }

    @Test
    public void testGetMerchantTransactions() throws Exception {
        when(merchantRepository.findByApiKey(anyString())).thenReturn(Optional.of(testMerchant));

        mockMvc.perform(get("/api/v1/merchant/transactions")
                .header("X-Api-Key", "test_key")
                .header("X-Api-Secret", "test_secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].amount").exists())
                .andExpect(jsonPath("$[0].status").exists());
    }
}
