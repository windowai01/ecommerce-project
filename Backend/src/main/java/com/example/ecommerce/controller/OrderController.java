package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

  @Autowired
  private OrderService orderService;

  @PostMapping
  public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
    Order savedOrder = orderService.createOrder(order);
    return ResponseEntity.ok(savedOrder);
  }

  @GetMapping
  public ResponseEntity<List<Order>> getAllOrders() {
    List<Order> orders = orderService.getAllOrders();
    return ResponseEntity.ok(orders);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
    Order order = orderService.getOrderById(id);
    return ResponseEntity.ok(order);
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
    List<Order> orders = orderService.getOrdersByUserId(userId);
    return ResponseEntity.ok(orders);
  }

  @GetMapping("/status/{status}")
  public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
    List<Order> orders = orderService.getOrdersByStatus(status);
    return ResponseEntity.ok(orders);
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
    Order updatedOrder = orderService.updateOrderStatus(id, status);
    return ResponseEntity.ok(updatedOrder);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
    orderService.deleteOrder(id);
    return ResponseEntity.ok("Order deleted successfully");
  }
}