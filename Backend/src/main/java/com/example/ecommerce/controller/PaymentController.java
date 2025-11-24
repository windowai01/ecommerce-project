package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;

    // Simulate Online Payment (Mock Payment Gateway)
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            String paymentMethod = request.get("paymentMethod").toString();

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Simulate payment processing delay (like real payment)
            Thread.sleep(1500);

            if (paymentMethod.equals("COD")) {
                // Cash on Delivery
                order.setPaymentMethod("COD");
                order.setPaymentStatus("PENDING"); // Will be paid on delivery
                order.setStatus("CONFIRMED");
                orderRepository.save(order);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Order placed successfully! Pay ₹" + order.getTotalAmount() + " on delivery.");
                response.put("orderId", order.getId());
                response.put("orderNumber", order.getOrderNumber());
                response.put("paymentMethod", "COD");

                return ResponseEntity.ok(response);

            } else if (paymentMethod.equals("CARD") || paymentMethod.equals("UPI")
                    || paymentMethod.equals("NETBANKING")) {
                // Mock Online Payment - Simulate successful payment
                String mockTransactionId = "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                order.setPaymentMethod(paymentMethod);
                order.setPaymentId(mockTransactionId);
                order.setPaymentStatus("PAID");
                order.setStatus("CONFIRMED");
                orderRepository.save(order);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment successful!");
                response.put("orderId", order.getId());
                response.put("orderNumber", order.getOrderNumber());
                response.put("transactionId", mockTransactionId);
                response.put("paymentMethod", paymentMethod);
                response.put("amountPaid", order.getTotalAmount());

                return ResponseEntity.ok(response);

            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid payment method"));
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.badRequest().body(new MessageResponse("Payment processing interrupted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Payment failed: " + e.getMessage()));
        }
    }

    // Simulate Payment Failure (for testing)
    @PostMapping("/simulate-failure")
    public ResponseEntity<?> simulateFailure(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Payment declined. Please try another payment method.");
        response.put("errorCode", "PAYMENT_DECLINED");
        return ResponseEntity.ok(response);
    }

    // Get Payment Status
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("paymentStatus", order.getPaymentStatus());
            response.put("paymentMethod", order.getPaymentMethod());
            response.put("transactionId", order.getPaymentId());
            response.put("amount", order.getTotalAmount());
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Refund (Mock)
    @PostMapping("/refund/{orderId}")
    public ResponseEntity<?> processRefund(@PathVariable Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            if (!"PAID".equals(order.getPaymentStatus())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Order is not paid"));
            }

            String refundId = "REF" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            order.setPaymentStatus("REFUNDED");
            order.setStatus("CANCELLED");
            orderRepository.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Refund processed successfully");
            response.put("refundId", refundId);
            response.put("amount", order.getTotalAmount());

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}