package com.paymentgateway.controller;

import com.paymentgateway.dto.ErrorResponse;
import com.paymentgateway.dto.PaymentRequest;
import com.paymentgateway.dto.PaymentResponse;
import com.paymentgateway.entity.Merchant;
import com.paymentgateway.entity.Order;
import com.paymentgateway.entity.Payment;
import com.paymentgateway.repository.OrderRepository;
import com.paymentgateway.repository.PaymentRepository;
import com.paymentgateway.repository.MerchantRepository;
import com.paymentgateway.service.PaymentProcessingService;
import com.paymentgateway.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    /**
     * POST /api/v1/payments
     * Create a payment (authenticated - merchant)
     */
    @PostMapping("/payments")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request, HttpServletRequest httpRequest) {
        try {
            Merchant merchant = (Merchant) httpRequest.getAttribute("merchant");
            if (merchant == null) {
                return ResponseEntity.status(401).body(
                    new ErrorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
                );
            }
            
            return createPaymentInternal(request, merchant);
        } catch (Exception e) {
            System.err.println("Error creating payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * POST /api/v1/payments/public
     * Create a payment (public - checkout page)
     */
    @PostMapping("/payments/public")
    public ResponseEntity<?> createPaymentPublic(@RequestBody PaymentRequest request) {
        try {
            // Get the order to find the merchant
            Optional<Order> orderOpt = orderRepository.findById(request.order_id);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("BAD_REQUEST_ERROR", "Order not found")
                );
            }
            
            Merchant merchant = orderOpt.get().getMerchant();
            return createPaymentInternal(request, merchant);
        } catch (Exception e) {
            System.err.println("Error creating payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * Internal method to handle payment creation logic
     */
    private ResponseEntity<?> createPaymentInternal(PaymentRequest request, Merchant merchant) {
        // Validate order exists and belongs to merchant
        Optional<Order> orderOpt = orderRepository.findById(request.order_id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("BAD_REQUEST_ERROR", "Order not found or does not belong to merchant")
            );
        }
        
        Order order = orderOpt.get();
        
        // Validate payment method and method-specific fields
        if (request.method == null || !request.method.matches("^(upi|card)$")) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("BAD_REQUEST_ERROR", "Invalid payment method")
            );
        }
        
        if (request.method.equals("upi")) {
            if (request.vpa == null || !ValidationUtil.validateVPA(request.vpa)) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("INVALID_VPA", "Invalid VPA format")
                );
            }
        } else if (request.method.equals("card")) {
            if (request.card == null || request.card.number == null || 
                request.card.expiry_month == null || request.card.expiry_year == null || 
                request.card.cvv == null || request.card.holder_name == null) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("BAD_REQUEST_ERROR", "Missing required card fields")
                );
            }
            
            // Validate card number
            if (!ValidationUtil.validateCardNumber(request.card.number)) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("INVALID_CARD", "Invalid card number")
                );
            }
            
            // Validate expiry
            if (!ValidationUtil.validateExpiry(request.card.expiry_month, request.card.expiry_year)) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("EXPIRED_CARD", "Card has expired")
                );
            }
        }
        
        // Generate unique payment ID
        String paymentId;
        boolean isUnique = false;
        do {
            paymentId = ValidationUtil.generatePaymentId();
            isUnique = !paymentRepository.existsById(paymentId);
        } while (!isUnique);
        
        // Create payment entity
        Payment payment = new Payment(paymentId, order, merchant, order.getAmount(), request.method);
        
        if (request.method.equals("upi")) {
            payment.setVpa(request.vpa);
        } else if (request.method.equals("card")) {
            String cardNetwork = ValidationUtil.detectCardNetwork(request.card.number);
            String cleanedNumber = request.card.number.replaceAll("[\\s-]", "");
            String last4 = cleanedNumber.substring(cleanedNumber.length() - 4);
            
            payment.setCardNetwork(cardNetwork);
            payment.setCardLast4(last4);
        }
        
        // Save payment with 'processing' status
        paymentRepository.save(payment);
        
        // Start async payment processing
        paymentProcessingService.processPaymentAsync(paymentId, request.method);
        
        // Build response
        PaymentResponse response = new PaymentResponse();
        response.id = payment.getId();
        response.order_id = payment.getOrder().getId();
        response.amount = payment.getAmount();
        response.currency = payment.getCurrency();
        response.method = payment.getMethod();
        response.status = payment.getStatus();
        response.created_at = payment.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
        
        if (request.method.equals("upi")) {
            response.vpa = payment.getVpa();
        } else if (request.method.equals("card")) {
            response.card_network = payment.getCardNetwork();
            response.card_last4 = payment.getCardLast4();
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * GET /api/v1/payments/{id}
     * Get payment details (authenticated - merchant)
     */
    @GetMapping("/payments/{id}")
    public ResponseEntity<?> getPayment(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            Merchant merchant = (Merchant) httpRequest.getAttribute("merchant");
            if (merchant == null) {
                return ResponseEntity.status(401).body(
                    new ErrorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
                );
            }
            
            Optional<Payment> payment = paymentRepository.findByIdAndMerchant(id, merchant);
            if (payment.isEmpty()) {
                return ResponseEntity.status(404).body(
                    new ErrorResponse("NOT_FOUND_ERROR", "Payment not found")
                );
            }
            
            return buildPaymentResponse(payment.get());
        } catch (Exception e) {
            System.err.println("Error getting payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * GET /api/v1/payments/{id}/public
     * Get payment details (public - checkout page)
     */
    @GetMapping("/payments/{id}/public")
    public ResponseEntity<?> getPaymentPublic(@PathVariable String id) {
        try {
            Optional<Payment> payment = paymentRepository.findById(id);
            if (payment.isEmpty()) {
                return ResponseEntity.status(404).body(
                    new ErrorResponse("NOT_FOUND_ERROR", "Payment not found")
                );
            }
            
            return buildPaymentResponse(payment.get());
        } catch (Exception e) {
            System.err.println("Error getting payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * Helper method to build payment response
     */
    private ResponseEntity<?> buildPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.id = payment.getId();
        response.order_id = payment.getOrder().getId();
        response.amount = payment.getAmount();
        response.currency = payment.getCurrency();
        response.method = payment.getMethod();
        response.status = payment.getStatus();
        response.created_at = payment.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
        response.updated_at = payment.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
        
        if (payment.getMethod().equals("upi")) {
            response.vpa = payment.getVpa();
        } else if (payment.getMethod().equals("card")) {
            response.card_network = payment.getCardNetwork();
            response.card_last4 = payment.getCardLast4();
        }
        
        if (payment.getErrorCode() != null) {
            response.error_code = payment.getErrorCode();
            response.error_description = payment.getErrorDescription();
        }
        
        return ResponseEntity.ok(response);
    }
}
