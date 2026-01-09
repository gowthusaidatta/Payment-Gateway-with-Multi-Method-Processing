package com.paymentgateway.service;

import com.paymentgateway.entity.Payment;
import com.paymentgateway.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class PaymentProcessingService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Value("${app.test-mode:false}")
    private Boolean testMode;
    
    @Value("${app.test-processing-delay:1000}")
    private Integer testProcessingDelay;
    
    @Value("${app.test-payment-success:true}")
    private Boolean testPaymentSuccess;
    
    @Value("${app.upi-success-rate:0.90}")
    private Double upiSuccessRate;
    
    @Value("${app.card-success-rate:0.95}")
    private Double cardSuccessRate;
    
    @Value("${app.processing-delay-min:5000}")
    private Integer processingDelayMin;
    
    @Value("${app.processing-delay-max:10000}")
    private Integer processingDelayMax;
    
    /**
     * Process payment asynchronously
     */
    public void processPaymentAsync(String paymentId, String method) {
        new Thread(() -> {
            try {
                processPayment(paymentId, method);
            } catch (Exception e) {
                System.err.println("Error processing payment " + paymentId + ": " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }
    
    /**
     * Process payment synchronously
     */
    public void processPayment(String paymentId, String method) throws InterruptedException {
        long delay;
        double successRate;
        
        if (testMode) {
            delay = testProcessingDelay;
            successRate = testPaymentSuccess ? 1.0 : 0.0;
        } else {
            delay = processingDelayMin + (long)(Math.random() * (processingDelayMax - processingDelayMin + 1));
            successRate = method.equals("upi") ? upiSuccessRate : cardSuccessRate;
        }
        
        // Simulate processing delay
        Thread.sleep(delay);
        
        // Determine success/failure
        boolean success = Math.random() < successRate;
        
        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment != null) {
            if (success) {
                payment.setStatus("success");
            } else {
                payment.setStatus("failed");
                payment.setErrorCode("PAYMENT_FAILED");
                payment.setErrorDescription("Payment processing failed");
            }
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }
    }
}
