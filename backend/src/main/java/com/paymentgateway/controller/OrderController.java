package com.paymentgateway.controller;

import com.paymentgateway.dto.ErrorResponse;
import com.paymentgateway.dto.OrderRequest;
import com.paymentgateway.dto.OrderResponse;
import com.paymentgateway.entity.Merchant;
import com.paymentgateway.entity.Order;
import com.paymentgateway.repository.OrderRepository;
import com.paymentgateway.repository.MerchantRepository;
import com.paymentgateway.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/v1")
public class OrderController {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    /**
     * POST /api/v1/orders
     * Create an order
     */
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, HttpServletRequest httpRequest) {
        try {
            Merchant merchant = (Merchant) httpRequest.getAttribute("merchant");
            if (merchant == null) {
                return ResponseEntity.status(401).body(
                    new ErrorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
                );
            }
            
            // Validate amount
            if (request.amount == null || request.amount < 100) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("BAD_REQUEST_ERROR", "Amount must be at least 100 paise")
                );
            }
            
            // Create order
            String orderId = ValidationUtil.generateOrderId();
            Order order = new Order(orderId, merchant, request.amount);
            
            if (request.currency != null) {
                order.setCurrency(request.currency);
            }
            if (request.receipt != null) {
                order.setReceipt(request.receipt);
            }
            if (request.notes != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode notesNode = mapper.valueToTree(request.notes);
                order.setNotes(notesNode);
            }
            
            orderRepository.save(order);
            
            // Build response
            OrderResponse response = new OrderResponse();
            response.id = order.getId();
            response.amount = order.getAmount();
            response.currency = order.getCurrency();
            response.receipt = order.getReceipt();
            response.status = order.getStatus();
            response.created_at = order.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * GET /api/v1/orders/{id}
     * Get order details (merchant only)
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            Merchant merchant = (Merchant) httpRequest.getAttribute("merchant");
            if (merchant == null) {
                return ResponseEntity.status(401).body(
                    new ErrorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
                );
            }
            
            Optional<Order> order = orderRepository.findByIdAndMerchant(id, merchant);
            if (order.isEmpty()) {
                return ResponseEntity.status(404).body(
                    new ErrorResponse("NOT_FOUND_ERROR", "Order not found")
                );
            }
            
            Order o = order.get();
            OrderResponse response = new OrderResponse();
            response.id = o.getId();
            response.amount = o.getAmount();
            response.currency = o.getCurrency();
            response.receipt = o.getReceipt();
            response.status = o.getStatus();
            response.created_at = o.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
    
    /**
     * GET /api/v1/orders/{id}/public
     * Get order details (public - for checkout page)
     */
    @GetMapping("/orders/{id}/public")
    public ResponseEntity<?> getOrderPublic(@PathVariable String id) {
        try {
            Optional<Order> order = orderRepository.findById(id);
            if (order.isEmpty()) {
                return ResponseEntity.status(404).body(
                    new ErrorResponse("NOT_FOUND_ERROR", "Order not found")
                );
            }
            
            Order o = order.get();
            OrderResponse response = new OrderResponse();
            response.id = o.getId();
            response.amount = o.getAmount();
            response.currency = o.getCurrency();
            response.receipt = o.getReceipt();
            response.status = o.getStatus();
            response.created_at = o.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ErrorResponse("INTERNAL_ERROR", "Internal server error")
            );
        }
    }
}
