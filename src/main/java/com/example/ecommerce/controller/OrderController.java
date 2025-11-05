package com.example.ecommerce.controller;

import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.model.Order;
import com.example.ecommerce.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  // ✅ CREATE ORDER (now returns Map)
  @PostMapping
  public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequest request) {
    Map<String, Object> response = orderService.createOrderWithDetails(request);
    return ResponseEntity.ok(response);
  }

  // ✅ GET ALL ORDERS
  @GetMapping("/all")
  public ResponseEntity<List<Order>> getAllOrders() {
    return ResponseEntity.ok(orderService.getAllOrders());
  }

  // ✅ GET ONE ORDER
  @GetMapping("/{id}")
  public ResponseEntity<?> getOrderById(@PathVariable Long id) {
    return orderService.getOrderById(id)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // ✅ DELETE ORDER
  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, Object>> deleteOrder(@PathVariable Long id) {
    boolean deleted = orderService.deleteOrder(id);
    if (deleted) {
      return ResponseEntity.ok(Map.of("message", "Order deleted successfully!"));
    } else {
      return ResponseEntity.status(404).body(Map.of("error", "Order not found!"));
    }
  }
}
